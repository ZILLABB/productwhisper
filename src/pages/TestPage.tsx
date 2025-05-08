import React, { useState } from 'react';
import { apiService } from '../services/api';
import { useErrorHandler } from '../utils/errorHandling';
import { Button, Card, Badge, LoadingSpinner, useToast } from '../components/common';
import { ContentContainer, FlexLayout } from '../components/layout';

const TestPage: React.FC = () => {
  const { showToast } = useToast();
  const { handleError } = useErrorHandler();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testApiCall = async () => {
    setLoading(true);
    try {
      const data = await apiService.getProductDetails(1);
      setResult(data);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'API call successful'
      });
    } catch (error) {
      handleError(error, 'Failed to fetch product details');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContentContainer maxWidth="lg" padding="md" center>
      <Card variant="elevated" padding="lg">
        <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
        
        <FlexLayout justify="start" align="center" gap="md" className="mb-6">
          <Button 
            variant="primary" 
            onClick={testApiCall}
            disabled={loading}
          >
            Test API Call
          </Button>
          
          {loading && <LoadingSpinner size="small" />}
        </FlexLayout>
        
        {result && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Result:</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Card>
    </ContentContainer>
  );
};

export default TestPage;
