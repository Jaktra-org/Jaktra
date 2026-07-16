import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../../src/components/ui/Card';

describe('Card components', () => {
  it('renders card grid parts correctly', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title text</CardTitle>
          <CardDescription>Description text</CardDescription>
        </CardHeader>
        <CardContent>Content body</CardContent>
      </Card>
    );

    expect(screen.getByText('Title text')).toBeInTheDocument();
    expect(screen.getByText('Description text')).toBeInTheDocument();
    expect(screen.getByText('Content body')).toBeInTheDocument();
  });
});
