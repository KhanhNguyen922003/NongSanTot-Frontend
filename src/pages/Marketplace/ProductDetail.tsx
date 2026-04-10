import React, { useEffect, useState } from 'react';
import { Product } from '../../shared/types';

 const ProductDetail: React.FC = () => {
  const [product, setProduct] = useState<Product | null>(null);

  const productId = '1'; // This would typically come from route params
  useEffect(() => {
    // Mock Product Data
    setProduct({
      id: productId,
      shopId: '1',
      name: 'Organic Tomatoes',
      price: 50000,
      quantity: 100,
      unit: 'kg',
      description: 'Freshly harvested organic tomatoes from Da Lat.',
      hasVerifiedDiary: true,
      diaries: [
        { id: 'd1', productId, date: '2026-03-01', description: 'Planted seeds', images: [] },
        { id: 'd2', productId, date: '2026-04-05', description: 'Harvested', images: [] }
      ]
    });
  }, [productId]);

  if (!product) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="bg-gray-200 w-full md:w-1/2 h-64 rounded flex items-center justify-center">
          Image Placeholder
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-2xl text-blue-600 my-2">{product.price.toLocaleString()} VND / {product.unit}</p>
          <p className="text-gray-700">{product.description}</p>
          {product.hasVerifiedDiary && (
            <div className="mt-4 bg-green-50 text-green-700 p-2 rounded inline-block border border-green-200">
              ✓ Verified Growth Diary available
            </div>
          )}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Growth Diary Timeline</h2>
        <div className="border-l-2 border-green-500 pl-4 space-y-4">
          {product.diaries?.map(diary => (
            <div key={diary.id} className="mb-4">
              <div className="text-sm text-gray-500 font-bold">{new Date(diary.date).toLocaleDateString()}</div>
              <div>{diary.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;