import { NextResponse } from 'next/server';

// 🔧 CONFIGURATION
const VIETQR_API_URL = 'https://api.vietqr.io/v2/business';
const API_TIMEOUT_MS = 5000; // 5 seconds timeout

/**
 * GET /api/tax-lookup?taxCode=0316794479
 * Proxy to VietQR API to look up business info by tax code.
 * Avoids CORS issues and hides external API from client.
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const taxCode = searchParams.get('taxCode')?.trim();

        // Validation: tax code required and must be numeric (10-14 digits)
        if (!taxCode) {
            return NextResponse.json(
                { success: false, message: 'Tax code is required' },
                { status: 400 }
            );
        }

        if (!/^\d{10,14}$/.test(taxCode)) {
            return NextResponse.json(
                { success: false, message: 'Invalid tax code format. Must be 10-14 digits.' },
                { status: 400 }
            );
        }

        // Call VietQR API with timeout
        const res = await fetch(`${VIETQR_API_URL}/${taxCode}`, {
            signal: AbortSignal.timeout(API_TIMEOUT_MS),
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!res.ok) {
            return NextResponse.json(
                { success: false, message: 'Tax lookup service unavailable' },
                { status: 502 }
            );
        }

        const data = await res.json();

        // VietQR returns code "00" on success
        if (data.code === '00' && data.data) {
            return NextResponse.json({
                success: true,
                data: {
                    taxCode: data.data.id || taxCode,
                    companyName: data.data.name || '',
                    internationalName: data.data.internationalName || '',
                    shortName: data.data.shortName || '',
                    address: data.data.address || '',
                },
            });
        }

        // Tax code not found
        return NextResponse.json(
            { success: false, message: 'Tax code not found' },
            { status: 404 }
        );
    } catch (error: any) {
        console.error('[API tax-lookup] Error:', error.message);

        // Handle timeout specifically
        if (error.name === 'TimeoutError' || error.name === 'AbortError') {
            return NextResponse.json(
                { success: false, message: 'Lookup timed out. Please try again.' },
                { status: 504 }
            );
        }

        return NextResponse.json(
            { success: false, message: 'Lookup failed. Please try again.' },
            { status: 500 }
        );
    }
}
