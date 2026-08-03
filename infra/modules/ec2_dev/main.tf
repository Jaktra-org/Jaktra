locals {
  name_prefix  = "${var.project_name}-${var.environment}"
  ecr_registry = split("/", var.backend_ecr_url)[0]

  compose_content = templatefile("${path.module}/templates/compose.yml.tftpl", {
    backend_image    = "${var.backend_ecr_url}:latest"
    ai_service_image = "${var.ai_service_ecr_url}:latest"
    backend_port     = var.backend_port
    ai_service_port  = var.ai_service_port
  })

  start_sh_content = templatefile("${path.module}/templates/start.sh.tftpl", {
    aws_region            = var.aws_region
    backend_secret_id     = var.backend_secret_id
    ai_service_secret_id  = var.ai_service_secret_id
    ecr_registry          = local.ecr_registry
    backend_port          = var.backend_port
    ai_service_port       = var.ai_service_port
  })

  userdata = templatefile("${path.module}/templates/userdata.sh.tftpl", {
    compose_content  = local.compose_content
    start_sh_content = local.start_sh_content
    github_repo      = "${var.project_name}"
  })
}


resource "aws_iam_role" "ec2_instance" {
  name = "${local.name_prefix}-ec2-instance-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  tags = { Name = "${local.name_prefix}-ec2-instance-role" }
}

resource "aws_iam_role_policy" "ec2_instance" {
  name = "ecr-and-secrets"
  role = aws_iam_role.ec2_instance.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ECRAuth"
        Effect = "Allow"
        Action = ["ecr:GetAuthorizationToken"]
        Resource = "*"
      },
      {
        Sid    = "ECRPull"
        Effect = "Allow"
        Action = ["ecr:BatchGetImage", "ecr:GetDownloadUrlForLayer",
                  "ecr:BatchCheckLayerAvailability", "ecr:DescribeRepositories"]
        Resource = [
          "arn:aws:ecr:${var.aws_region}:*:repository/${var.project_name}/*"
        ]
      },
      {
        Sid    = "SecretsManagerRead"
        Effect = "Allow"
        Action = ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"]
        Resource = [var.backend_secret_id, var.ai_service_secret_id]
      },
      {
        Sid    = "CloudWatchLogs"
        Effect = "Allow"
        Action = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "arn:aws:logs:${var.aws_region}:*:log-group:/ec2/${local.name_prefix}/*"
      }
    ]
  })
}

resource "aws_iam_instance_profile" "ec2" {
  name = "${local.name_prefix}-ec2-profile"
  role = aws_iam_role.ec2_instance.name
  tags = { Name = "${local.name_prefix}-ec2-profile" }
}


resource "aws_security_group" "ec2" {
  name        = "${local.name_prefix}-ec2-sg"
  description = "Dev EC2: SSH from admin IP, backend + ai-service from internet"
  vpc_id      = var.vpc_id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_allowed_cidr]
  }

  ingress {
    description = "Backend API"
    from_port   = var.backend_port
    to_port     = var.backend_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "AI Service"
    from_port   = var.ai_service_port
    to_port     = var.ai_service_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "All outbound (ECR pull, Groq API, SendGrid, Neon DB)"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${local.name_prefix}-ec2-sg" }
}



resource "aws_key_pair" "dev" {
  key_name   = "${local.name_prefix}-key"
  public_key = var.ssh_public_key
  tags       = { Name = "${local.name_prefix}-key" }
}


data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "state"
    values = ["available"]
  }
}

resource "aws_instance" "dev" {
  ami                    = data.aws_ami.al2023.id
  instance_type          = var.instance_type
  subnet_id              = var.subnet_id
  vpc_security_group_ids = [aws_security_group.ec2.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2.name
  key_name               = aws_key_pair.dev.key_name

  monitoring = false

  user_data = base64encode(local.userdata)

  root_block_device {
    volume_size           = 30   
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = true
  }

  tags = { Name = "${local.name_prefix}-ec2" }

  lifecycle {
    ignore_changes = [user_data, ami]
  }
}



resource "aws_eip" "dev" {
  instance = aws_instance.dev.id
  domain   = "vpc"

  depends_on = [aws_instance.dev]
  tags       = { Name = "${local.name_prefix}-eip" }
}
