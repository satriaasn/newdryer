import { NextResponse } from "next/server";
import { productionService } from "@/services/production.service";
import { CreateProductionLogSchema } from "@/lib/validators";

/**
 * Handle GET requests for production logs
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dryerId = searchParams.get('dryerId') || undefined;
    const batchId = searchParams.get('batchId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');

    const logs = await productionService.getProductionLogs({ 
      dryerId, 
      batchId, 
      limit 
    });

    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Handle POST requests to insert new logs (IOT Gateway)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = CreateProductionLogSchema.parse(body);
    
    // In a real production scenario, we would also verify the IOT Gateway's 
    // API key or token before processing the request.
    
    const newLog = await productionService.logProduction(validatedData as any);
    
    return NextResponse.json(newLog, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
