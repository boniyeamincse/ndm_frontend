import React from 'react';
import { render, screen } from '@testing-library/react';
import Input from './Input';

describe('Input', () => {
  it('renders label and error message', () => {
    render(<Input label="Email" error="Required" placeholder="Type here" />);

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument();
  });

  it('does not render error when not provided', () => {
    render(<Input label="Name" placeholder="Your name" />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.queryByText('Required')).not.toBeInTheDocument();
  });
});
