import React, { useState } from 'react';
import { Button } from '../common/components';
import { FiArrowRight, FiDownload, FiCheck, FiX, FiAlertTriangle, FiInfo } from 'react-icons/fi';

const ButtonDemoPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadingClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Button Component Demo</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Button Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="danger">Danger Button</Button>
          <Button variant="success">Success Button</Button>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Button Sizes</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="xs">Extra Small</Button>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="xl">Extra Large</Button>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Button with Icons</h2>
        <div className="flex flex-wrap gap-4">
          <Button leftIcon={<FiInfo />}>Left Icon</Button>
          <Button rightIcon={<FiArrowRight />}>Right Icon</Button>
          <Button leftIcon={<FiCheck />} rightIcon={<FiArrowRight />}>Both Icons</Button>
          <Button variant="outline" leftIcon={<FiDownload />}>Download</Button>
          <Button variant="danger" leftIcon={<FiX />}>Cancel</Button>
          <Button variant="success" leftIcon={<FiCheck />}>Confirm</Button>
          <Button variant="ghost" leftIcon={<FiAlertTriangle />}>Warning</Button>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Loading State</h2>
        <div className="flex flex-wrap gap-4">
          <Button isLoading>Loading Button</Button>
          <Button variant="outline" isLoading>Loading Outline</Button>
          <Button
            variant="primary"
            isLoading={isLoading}
            onClick={handleLoadingClick}
          >
            {isLoading ? 'Loading...' : 'Click to Load'}
          </Button>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Full Width Button</h2>
        <div className="max-w-md">
          <Button fullWidth>Full Width Button</Button>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Link Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button to="/about">Internal Link</Button>
          <Button href="https://example.com" external>External Link</Button>
          <Button to="/contact" variant="outline">Contact Page</Button>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Disabled State</h2>
        <div className="flex flex-wrap gap-4">
          <Button disabled>Disabled Button</Button>
          <Button variant="outline" disabled>Disabled Outline</Button>
          <Button variant="ghost" disabled>Disabled Ghost</Button>
        </div>
      </section>
    </div>
  );
};

export default ButtonDemoPage;
