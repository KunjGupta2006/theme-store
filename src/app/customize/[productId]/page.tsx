interface CustomizePageProps {
  params: Promise<{ productId: string }>;
}

export default async function CustomizePage({ params }: CustomizePageProps) {
  const { productId } = await params;

  return (
    <main className="min-h-screen bg-[#F5F1EA] flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-['Inter_Tight'] text-3xl font-bold text-[#111111]">
          Customize
        </h1>
        <p className="text-sm text-[#666666] mt-2">
          Product ID: {productId}
        </p>
      </div>
    </main>
  );
}
