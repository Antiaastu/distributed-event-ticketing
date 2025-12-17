export function SeatLegend() {
  return (
    <div className="bg-(--card) border border-(--border) rounded-2xl p-6 shadow-lg">
      <h5 className="mb-4">Seat Status Legend</h5>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-(--seat-available) border-2 border-white/20 shadow-md"></div>
          <div>
            <p className="text-sm">Available</p>
            <p className="text-xs text-(--muted-foreground)">Click to select</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-(--seat-selected) border-2 border-white/20 shadow-md"></div>
          <div>
            <p className="text-sm">Selected</p>
            <p className="text-xs text-(--muted-foreground)">Your choice</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-(--seat-locked) border-2 border-white/20 shadow-md opacity-60"></div>
          <div>
            <p className="text-sm">Locked</p>
            <p className="text-xs text-(--muted-foreground)">Processing</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-(--seat-sold) border-2 border-white/20 shadow-md opacity-40"></div>
          <div>
            <p className="text-sm">Sold</p>
            <p className="text-xs text-(--muted-foreground)">Unavailable</p>
          </div>
        </div>
      </div>
    </div>
  );
}