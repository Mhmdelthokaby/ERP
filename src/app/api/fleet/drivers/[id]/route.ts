import { NextResponse } from "next/server"

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  return NextResponse.json({ data: { id: params.id } })
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = await request.json()
  return NextResponse.json({ data: { id: params.id, ...body } })
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  return NextResponse.json({ data: { id: params.id } })
}
