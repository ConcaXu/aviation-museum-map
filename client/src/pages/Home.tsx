import { useState } from 'react';
import MuseumMap from '@/components/MuseumMap';

interface Museum {
  id: number;
  name: string;
  province: string;
  city: string;
  lat: number;
  lng: number;
  description: string;
  address: string;
}

export default function Home() {
  const [selectedMuseum, setSelectedMuseum] = useState<Museum | null>(null);

  return (
    <div className="w-full h-screen flex flex-col">
      <header className="bg-gradient-to-r from-sky-blue to-dark-blue text-white px-6 py-4 shadow-lg z-20">
        <h1 className="text-2xl font-bold">中国航空博物馆分布图</h1>
        <p className="text-sm text-blue-100 mt-1">探索全国的航空博物馆 • 放大查看具体位置</p>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1">
          <MuseumMap onMuseumSelect={setSelectedMuseum} />
        </div>

        {selectedMuseum && (
          <div className="w-96 bg-card text-card-foreground border-l border-border shadow-lg overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-sky-blue">{selectedMuseum.name}</h2>
                <button
                  onClick={() => setSelectedMuseum(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-secondary rounded-lg p-4">
                  <h3 className="font-semibold text-sm mb-2 text-foreground">位置信息</h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    <span className="font-medium">省份:</span> {selectedMuseum.province}
                  </p>
                  <p className="text-sm text-muted-foreground mb-1">
                    <span className="font-medium">城市:</span> {selectedMuseum.city}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">坐标:</span> {selectedMuseum.lat.toFixed(4)}°N, {selectedMuseum.lng.toFixed(4)}°E
                  </p>
                </div>

                <div className="bg-secondary rounded-lg p-4">
                  <h3 className="font-semibold text-sm mb-2 text-foreground">地址</h3>
                  <p className="text-sm text-muted-foreground">{selectedMuseum.address}</p>
                </div>

                <div className="bg-secondary rounded-lg p-4">
                  <h3 className="font-semibold text-sm mb-2 text-foreground">简介</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedMuseum.description}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
