'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalLink, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PlatformCodeResponse {
  success: boolean;
  data?: {
    temporaryCode: string;
    outlink: string;
    expiresAt: string;
  };
  error?: string;
}

export default function PlatformIntegration() {
  const [uuid, setUuid] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [platformData, setPlatformData] = useState<PlatformCodeResponse['data'] | null>(null);
  const [copied, setCopied] = useState(false);

  const handleValidateUuid = async () => {
    if (!uuid.trim()) {
      toast.error('UUID를 입력해주세요');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/platform/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uuid }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('UUID 검증 성공');
      } else {
        toast.error(data.error || 'UUID 검증 실패');
      }
    } catch (error) {
      toast.error('UUID 검증 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestCode = async () => {
    if (!uuid.trim()) {
      toast.error('UUID를 입력해주세요');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔄 서버 API 호출 시작');
      const response = await fetch('/api/platform/request-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uuid }),
      });

      console.log('📡 서버 응답 상태:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PlatformCodeResponse = await response.json();
      console.log('📥 서버 응답 데이터:', data);

      if (data.success && data.data) {
        setPlatformData(data.data);
        toast.success('임시 코드 생성 성공');
      } else {
        console.log('❌ 서버 API 실패:', data.error);
        toast.error(data.error || '임시 코드 생성 실패');
      }
    } catch (error) {
      console.error('❌ API 호출 실패:', error);
      toast.error('임시 코드 생성 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyOutlink = async () => {
    if (!platformData?.outlink) return;

    try {
      await navigator.clipboard.writeText(platformData.outlink);
      setCopied(true);
      toast.success('아웃링크가 클립보드에 복사되었습니다');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('클립보드 복사에 실패했습니다');
    }
  };

  const handleOpenOutlink = () => {
    if (!platformData?.outlink) return;
    window.open(platformData.outlink, '_blank');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            플랫폼 연동
          </CardTitle>
          <CardDescription>
            게임 클라이언트에서 플랫폼으로의 연동을 관리합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* UUID 입력 섹션 */}
          <div className="space-y-2">
            <Label htmlFor="uuid">게임 UUID (계정명)</Label>
            <div className="flex gap-2">
              <Input
                id="uuid"
                value={uuid}
                onChange={(e) => setUuid(e.target.value)}
                placeholder="게임 UUID (계정명)를 입력하세요"
              />
              <Button
                onClick={handleValidateUuid}
                disabled={isLoading}
                variant="outline"
              >
                검증
              </Button>
            </div>
          </div>

          {/* 임시 코드 요청 버튼 */}
          <Button
            onClick={handleRequestCode}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? '처리 중...' : '임시 코드 요청'}
          </Button>
        </CardContent>
      </Card>

      {/* 결과 표시 */}
      {platformData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              플랫폼 연동 결과
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>임시 코드</Label>
              <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
                <code className="text-sm">{platformData.temporaryCode}</code>
              </div>
            </div>

            <div className="space-y-2">
              <Label>아웃링크</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={platformData.outlink}
                  readOnly
                  className="flex-1"
                />
                <Button
                  onClick={handleCopyOutlink}
                  variant="outline"
                  size="sm"
                >
                  {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button
                  onClick={handleOpenOutlink}
                  variant="outline"
                  size="sm"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>만료 시간</Label>
              <p className="text-sm text-gray-600">
                {new Date(platformData.expiresAt).toLocaleString('ko-KR')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 