'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

// 🔧 UI CONFIGURATION
const PIN_CODE = process.env.NEXT_PUBLIC_DEVICE_REGISTER_PIN || '8899';
const ANIMATION_DURATION = 0.3;
const CARD_MAX_WIDTH = '480px';

const RegisterDevicePage = () => {
  const [pin, setPin] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'already'>('idle');
  const [existingDevice, setExistingDevice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Check if device is already registered
  useEffect(() => {
    const savedDeviceId = localStorage.getItem('REGISTERED_DEVICE_ID');
    if (savedDeviceId) {
      setExistingDevice(savedDeviceId);
      setStatus('already');
    }
  }, []);

  const handleRegister = async () => {
    // Validate PIN
    if (pin !== PIN_CODE) {
      setErrorMsg('Mã PIN không đúng. Vui lòng thử lại.');
      setStatus('error');
      return;
    }

    if (!deviceName.trim()) {
      setErrorMsg('Vui lòng nhập tên thiết bị.');
      setStatus('error');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const supabase = createClient();
      const deviceId = crypto.randomUUID();

      const { error } = await supabase.from('RegisteredDevices').insert({
        device_id: deviceId,
        device_name: deviceName.trim(),
        device_type: 'tablet',
        is_active: true,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Save to localStorage (same domain)
      localStorage.setItem('REGISTERED_DEVICE_ID', deviceId);
      localStorage.setItem('REGISTERED_DEVICE_NAME', deviceName.trim());

      setExistingDevice(deviceId);
      setStatus('success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi không xác định';
      setErrorMsg(`Lỗi đăng ký: ${message}`);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnregister = async () => {
    if (!existingDevice) return;

    setIsLoading(true);
    try {
      const supabase = createClient();
      await supabase
        .from('RegisteredDevices')
        .update({ is_active: false })
        .eq('device_id', existingDevice);

      localStorage.removeItem('REGISTERED_DEVICE_ID');
      localStorage.removeItem('REGISTERED_DEVICE_NAME');

      setExistingDevice(null);
      setStatus('idle');
      setPin('');
      setDeviceName('');
    } catch {
      setErrorMsg('Lỗi khi hủy đăng ký.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: CARD_MAX_WIDTH,
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '40px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          transition: `all ${ANIMATION_DURATION}s ease`,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              fontSize: '48px',
              marginBottom: '12px',
            }}
          >
            📱
          </div>
          <h1
            style={{
              color: '#fff',
              fontSize: '24px',
              fontWeight: 700,
              margin: '0 0 8px 0',
            }}
          >
            Đăng Ký Tablet Sảnh
          </h1>
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '14px',
              margin: 0,
            }}
          >
            Chỉ admin được phép thực hiện
          </p>
        </div>

        {/* Already Registered */}
        {status === 'already' && (
          <div
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
            <p style={{ color: '#93c5fd', fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0' }}>
              Thiết bị đã được đăng ký
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '12px', margin: '0 0 16px 0', wordBreak: 'break-all' }}>
              ID: {existingDevice}
            </p>
            <button
              onClick={handleUnregister}
              disabled={isLoading}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1,
                transition: 'all 0.2s',
              }}
            >
              {isLoading ? '⏳ Đang xử lý...' : '🗑️ Hủy đăng ký thiết bị'}
            </button>
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div
            style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
            <p style={{ color: '#86efac', fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0' }}>
              Đăng ký thành công!
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px', margin: 0 }}>
              Tablet này đã được ghi nhận. Từ giờ sẽ hiện QR Code sau mỗi lần khách checkout.
            </p>
          </div>
        )}

        {/* Registration Form */}
        {status === 'idle' || status === 'error' ? (
          <div>
            {/* PIN Input */}
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '8px',
                }}
              >
                🔐 Mã PIN bảo mật
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setStatus('idle');
                  setErrorMsg('');
                }}
                placeholder="Nhập mã PIN..."
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: status === 'error' ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border 0.2s',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Device Name Input */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '8px',
                }}
              >
                📋 Tên thiết bị
              </label>
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder='VD: "iPad Sảnh 1"'
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border 0.2s',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Error message */}
            {errorMsg && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                }}
              >
                <p style={{ color: '#fca5a5', fontSize: '14px', margin: 0 }}>⚠️ {errorMsg}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleRegister}
              disabled={isLoading || !pin || !deviceName.trim()}
              style={{
                width: '100%',
                padding: '16px',
                background: isLoading || !pin || !deviceName.trim()
                  ? 'rgba(99, 102, 241, 0.3)'
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none',
                borderRadius: '14px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 700,
                cursor: isLoading || !pin || !deviceName.trim() ? 'not-allowed' : 'pointer',
                opacity: isLoading || !pin || !deviceName.trim() ? 0.5 : 1,
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
              }}
            >
              {isLoading ? '⏳ Đang đăng ký...' : '✅ Đăng Ký Thiết Bị Này'}
            </button>
          </div>
        ) : null}

        {/* Footer info */}
        <div
          style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center',
          }}
        >
          <p style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '12px', margin: 0 }}>
            ℹ️ Sau khi đăng ký, Tablet này sẽ tự động hiện QR Code mỗi lần khách checkout.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterDevicePage;
