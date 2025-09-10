import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useForm } from 'react-hook-form';

import { WizardForm } from '../WizardForm';
import { createActionHelpers } from '../../actions/actionHelpers';
import type { WizardFormConfig } from '../types';

// Mock form data
const mockFormData = {
  name: '',
  email: '',
  agree: false,
};

// Mock wizard steps
const mockSteps = [
  {
    title: 'Step 1',
    description: 'Basic Info',
    shortTitle: 'Info',
    icon: <span>📝</span>,
    fields: [
      {
        name: 'name' as const,
        label: 'Name',
        type: 'text',
        required: true,
      },
      {
        name: 'email' as const,
        label: 'Email',
        type: 'email',
        required: true,
      },
    ],
  },
  {
    title: 'Step 2',
    description: 'Confirmation',
    shortTitle: 'Confirm',
    icon: <span>✅</span>,
    fields: [
      {
        name: 'agree' as const,
        label: 'Agree to terms',
        type: 'checkbox',
        required: true,
      },
    ],
  },
];

describe('Dynamic Action Buttons', () => {
  const mockOnSubmit = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('static action buttons work (existing functionality)', () => {
    const { button, submit } = createActionHelpers();
    
    const config: WizardFormConfig<any, any> = {
      steps: mockSteps,
      actionButtons: [
        button(() => {}, 'Custom Button'),
        submit(mockOnSubmit, 'Custom Submit'),
      ],
      onSubmit: mockOnSubmit,
    };

    render(
      <WizardForm
        config={config}
        closeDialog={mockOnClose}
      />
    );

    expect(screen.getByText('Custom Button')).toBeInTheDocument();
    expect(screen.getByText('Custom Submit')).toBeInTheDocument();
  });

  test('dynamic action buttons callback receives formMethods', () => {
    const mockCallback = jest.fn();
    
    const config: WizardFormConfig<any, any> = {
      steps: mockSteps,
      actionButtons: (formMethods) => {
        mockCallback(formMethods);
        return [
          {
            type: 'button' as const,
            label: 'Dynamic Button',
            onClick: () => {},
          },
        ];
      },
      onSubmit: mockOnSubmit,
    };

    render(
      <WizardForm
        config={config}
        closeDialog={mockOnClose}
      />
    );

    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        getValues: expect.any(Function),
        formState: expect.any(Object),
      })
    );
    expect(screen.getByText('Dynamic Button')).toBeInTheDocument();
  });

  test('callback returning undefined falls back to default actions', () => {
    const config: WizardFormConfig<any, any> = {
      steps: mockSteps,
      actionButtons: () => undefined, // Should fallback to default
      onSubmit: mockOnSubmit,
    };

    render(
      <WizardForm
        config={config}
        closeDialog={mockOnClose}
      />
    );

    // Should show default wizard actions (Next/Submit, Cancel)
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('callback returning false disables actions', () => {
    const config: WizardFormConfig<any, any> = {
      steps: mockSteps,
      actionButtons: () => false, // Should disable actions
      onSubmit: mockOnSubmit,
    };

    render(
      <WizardForm
        config={config}
        closeDialog={mockOnClose}
      />
    );

    // Should not show any action buttons
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    expect(screen.queryByText('Submit')).not.toBeInTheDocument();
  });

  test('callback can access form values to conditionally show buttons', () => {
    const config: WizardFormConfig<any, any> = {
      steps: mockSteps,
      actionButtons: (formMethods) => {
        const values = formMethods.getValues();
        
        if (values.name && values.name.includes('admin')) {
          return [
            {
              type: 'button' as const,
              label: 'Admin Action',
              onClick: () => {},
            },
          ];
        }
        
        return undefined; // Fallback to default
      },
      onSubmit: mockOnSubmit,
      defaultValues: {
        name: 'admin_user',
        email: 'admin@test.com',
        agree: false,
      },
    };

    render(
      <WizardForm
        config={config}
        closeDialog={mockOnClose}
      />
    );

    // Should show admin action because name contains 'admin'
    expect(screen.getByText('Admin Action')).toBeInTheDocument();
  });

  test('callback returning empty array shows no actions', () => {
    const config: WizardFormConfig<any, any> = {
      steps: mockSteps,
      actionButtons: () => [], // Empty array
      onSubmit: mockOnSubmit,
    };

    render(
      <WizardForm
        config={config}
        closeDialog={mockOnClose}
      />
    );

    // Should not show any action buttons
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });

  test('actionButtons: false still works (disable actions)', () => {
    const config: WizardFormConfig<any, any> = {
      steps: mockSteps,
      actionButtons: false, // Explicitly disable
      onSubmit: mockOnSubmit,
    };

    render(
      <WizardForm
        config={config}
        closeDialog={mockOnClose}
      />
    );

    // Should not show any action buttons
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });
});

// Example usage documentation
/*
Example usage of dynamic action buttons:

const config: WizardFormConfig = {
  steps: [...],
  actionButtons: (formMethods) => {
    const values = formMethods.getValues();
    const { isValid, isSubmitting } = formMethods.formState;
    
    // Disable submit button if form is invalid or submitting
    if (!isValid || isSubmitting) {
      return [
        {
          type: 'button' as const,
          label: 'Please complete form',
          disabled: true,
          onClick: () => {},
        },
      ];
    }
    
    // Show special actions for specific form values
    if (values.userType === 'premium') {
      return [
        {
          type: 'button' as const,
          label: 'Premium Features',
          onClick: () => showPremiumFeatures(),
        },
        {
          type: 'submit' as const,
          label: 'Upgrade Now',
        },
      ];
    }
    
    // Fallback to default actions
    return undefined;
  },
  onSubmit: handleSubmit,
};
*/