import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courier, resi } = body;

    if (!resi || !courier) {
      return NextResponse.json({ error: "Courier and Tracking Number are required" }, { status: 400 });
    }

    // =========================================================================
    // 🌟 TEMPAT MENARUH LOGIKA API AGGREGATOR ASLI (Misal: Biteship / Binderbyte)
    // =========================================================================
    const API_KEY = process.env.SHIPPING_AGGREGATOR_API_KEY; 

    if (API_KEY) {
      /* 
      // CONTOH JIKA NANTI BOS PAKAI BINDERBYTE:
      const response = await fetch(`https://api.binderbyte.com/v1/track?api_key=${API_KEY}&courier=${courier}&awb=${resi}`);
      const data = await response.json();
      
      if (data.status === 200) {
        // Mapping data asli dari API ke format frontend kita
        return NextResponse.json({
          status: data.data.summary.status,
          courier_name: data.data.summary.courier,
          receiver_name: data.data.summary.receiver,
          history: data.data.history.map((h: any) => ({
            status_description: h.desc,
            time: h.date,
            location: h.location || "Transit Hub"
          }))
        });
      }
      */
    }

    // =========================================================================
    // 🌟 DUMMY DATA UNTUK PRESENTASI / TESTING (Jika API Key belum disetting)
    // =========================================================================
    
    // Sengaja kita kasih delay 1.5 detik biar efek loading (Loader2) di frontend kelihatan elegan
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Menyesuaikan nama kurir untuk tampilan
    const courierDisplayNames: Record<string, string> = {
      lion: "Lion Parcel",
      gosend: "GoSend Instant",
      pos: "Pos Indonesia"
    };

    const mockResponse = {
      status: "ON THE WAY",
      courier_name: courierDisplayNames[courier] || courier.toUpperCase(),
      receiver_name: "Valued Customer",
      history: [
        {
          status_description: "Out for delivery by courier",
          time: new Date().toLocaleString("id-ID", { hour: '2-digit', minute: '2-digit' }) + " WITA",
          location: "Denpasar Delivery Hub"
        },
        {
          status_description: "Package departed from transit facility",
          time: "08:15 WITA",
          location: "Kuta Sorting Center"
        },
        {
          status_description: "Package arrived at transit facility",
          time: "06:30 WITA",
          location: "Kuta Sorting Center"
        },
        {
          status_description: "Package picked up by courier",
          time: "Yesterday, 18:45 WITA",
          location: "Niconico Resort Bali"
        },
        {
          status_description: "Shipping label created",
          time: "Yesterday, 16:20 WITA",
          location: "Niconico Resort Bali"
        }
      ]
    };

    // Return mock data
    return NextResponse.json(mockResponse);

  } catch (error) {
    console.error("Tracking API Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}