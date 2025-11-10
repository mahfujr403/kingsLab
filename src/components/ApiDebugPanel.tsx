import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { config } from '../lib/config';

interface ApiEndpointTest {
  endpoint: string;
  status: 'idle' | 'pending' | 'success' | 'error';
  statusCode?: number;
  data?: any;
  error?: string;
  errorType?: 'network' | 'cors' | 'http' | 'unknown';
}

const INITIAL_TESTS: ApiEndpointTest[] = [
  { endpoint: '/lab-info', status: 'idle' },
  { endpoint: '/hero', status: 'idle' },
  { endpoint: '/contact-info', status: 'idle' },
  { endpoint: '/research-areas', status: 'idle' },
  { endpoint: '/publications', status: 'idle' },
  { endpoint: '/team-members', status: 'idle' },
  { endpoint: '/timeline', status: 'idle' },
];

export function ApiDebugPanel() {
  const [tests, setTests] = useState<ApiEndpointTest[]>(INITIAL_TESTS);
  const [isVisible, setIsVisible] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const testEndpoint = useCallback(async (endpoint: string) => {
    const url = `${config.apiBaseUrl}${endpoint}`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        mode: 'cors', // Explicitly set CORS mode
      });

      clearTimeout(timeoutId);

      let data;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      setTests(prev => prev.map(test => 
        test.endpoint === endpoint 
          ? { 
              ...test, 
              status: response.ok ? 'success' : 'error',
              statusCode: response.status,
              data: data,
              error: response.ok ? undefined : `HTTP ${response.status}`,
              errorType: response.ok ? undefined : 'http'
            }
          : test
      ));
    } catch (error) {
      let errorType: 'network' | 'cors' | 'http' | 'unknown' = 'unknown';
      let errorMessage = 'Unknown error';

      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Detect error type
        if (error.name === 'AbortError') {
          errorType = 'network';
          errorMessage = 'Request timeout (10s)';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorType = 'network';
          errorMessage = 'Cannot reach API server';
        } else if (error.message.includes('CORS')) {
          errorType = 'cors';
          errorMessage = 'CORS policy blocked request';
        }
      }

      setTests(prev => prev.map(test => 
        test.endpoint === endpoint 
          ? { 
              ...test, 
              status: 'error',
              error: errorMessage,
              errorType: errorType
            }
          : test
      ));
    }
  }, []);

  const runAllTests = useCallback(async () => {
    setIsTesting(true);
    setTests(INITIAL_TESTS.map(test => ({ ...test, status: 'pending' as const })));
    
    // Run tests sequentially to avoid overwhelming the server
    for (const test of INITIAL_TESTS) {
      await testEndpoint(test.endpoint);
    }
    
    setIsTesting(false);
  }, [testEndpoint]);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-yellow-100 border-yellow-400 text-yellow-900 hover:bg-yellow-200 dark:bg-yellow-900 dark:border-yellow-600 dark:text-yellow-100 dark:hover:bg-yellow-800"
        >
          <AlertCircle className="h-4 w-4 mr-2" />
          API Debug
        </Button>
      </div>
    );
  }

  const hasErrors = tests.some(t => t.status === 'error');
  const allSuccess = tests.every(t => t.status === 'success');
  const allIdle = tests.every(t => t.status === 'idle');

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] flex flex-col">
      <Card className="shadow-2xl border-2 border-yellow-400 dark:border-yellow-600 flex flex-col max-h-full">
        <CardHeader className="bg-yellow-50 dark:bg-yellow-900/20 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              API Diagnostics
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={runAllTests}
                variant="outline"
                size="sm"
                disabled={isTesting}
                className="dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                <RefreshCw className={`h-3 w-3 ${isTesting ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                variant="ghost"
                size="sm"
                className="dark:hover:bg-gray-700"
              >
                ×
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-2 overflow-y-auto flex-1">
          <div className="text-xs mb-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
            <div><strong>API Base URL:</strong> {config.apiBaseUrl}</div>
            {allIdle && (
              <div className="mt-2 text-blue-600 dark:text-blue-400">
                Click the refresh button to test all endpoints
              </div>
            )}
          </div>

          {/* Overall Status */}
          {!allIdle && (
            <div className={`text-xs p-2 rounded border ${
              allSuccess 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' 
                : hasErrors
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
            }`}>
              {allSuccess && '✅ All endpoints are working!'}
              {hasErrors && (
                <div>
                  <div className="font-semibold mb-1">⚠️ Connection Issues Detected</div>
                  {tests.some(t => t.errorType === 'network') && (
                    <div className="flex items-start gap-2 mt-1">
                      <WifiOff className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Network Error:</strong> Cannot reach the API server at {config.apiBaseUrl}.
                        Make sure your Laravel backend is running on that address.
                      </span>
                    </div>
                  )}
                  {tests.some(t => t.errorType === 'cors') && (
                    <div className="mt-1">
                      <strong>CORS Error:</strong> The API server is blocking requests from this domain.
                      Add CORS headers in your Laravel backend.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {tests.map((test) => (
            <div
              key={test.endpoint}
              className="p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  {test.status === 'idle' && (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                  )}
                  {test.status === 'pending' && (
                    <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-500 rounded-full" />
                  )}
                  {test.status === 'success' && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  {test.status === 'error' && (
                    <>
                      {test.errorType === 'network' ? (
                        <WifiOff className="h-4 w-4 text-red-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </>
                  )}
                  <span className="text-xs font-mono dark:text-gray-300">{test.endpoint}</span>
                </div>
                {test.statusCode && (
                  <span className={`text-xs px-2 py-1 rounded ${
                    test.statusCode === 200 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {test.statusCode}
                  </span>
                )}
              </div>
              
              {test.error && (
                <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                  {test.error}
                </div>
              )}
              
              {test.data && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                    View Response
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded overflow-x-auto text-[10px] dark:text-gray-300">
                    {JSON.stringify(test.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}

          {/* Help Section */}
          {hasErrors && (
            <div className="text-xs p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
              <div className="font-semibold mb-2 text-blue-900 dark:text-blue-300">💡 Quick Fixes:</div>
              <ul className="space-y-1 text-blue-800 dark:text-blue-400 list-disc list-inside">
                <li>Start your Laravel backend: <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">php artisan serve</code></li>
                <li>Check the API URL in <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">/lib/config.ts</code></li>
                <li>See <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">/QUICK_START.md</code> for setup instructions</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
