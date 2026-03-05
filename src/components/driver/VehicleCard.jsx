import {
  Plug, Star, Zap, Calendar,
  Power, PowerOff
} from 'lucide-react';

export default function VehicleCard({ vehicle, onUpdate }) {
  const isActive = vehicle.vehicleStatus === 'ACTIVE';

  const pointsBalance =
    Number.isFinite(Number(vehicle?.pointsBalance))
      ? Number(vehicle.pointsBalance)
      : 0;

  return (
    <div className={`vh-card ${!isActive ? 'vh-card--inactive' : ''}`}>
      {/* Gradient accent bar */}
      <div className="vh-card-accent" />

      <div className="vh-card-content">
        {/* Top: brand + status badge */}
        <div className="vh-card-top">
          <span className="vh-card-brand">{vehicle.brand}</span>
          <span className={`vh-card-badge ${isActive ? 'active' : 'inactive'}`}>
            <span className="vh-card-badge-dot" />
            {isActive ? 'Hoạt động' : 'Ngưng'}
          </span>
        </div>

        {/* Vehicle name — large & bold */}
        <h3 className="vh-card-name">{vehicle.modelName}</h3>

        {/* License plate */}
        <div className="vh-card-plate">
          <span className="vh-card-plate-flag">VN</span>
          <span className="vh-card-plate-text">{vehicle.licensePlate}</span>
        </div>

        {/* Spec chips */}
        <div className="vh-card-chips">
          {vehicle.year && (
            <span className="vh-card-chip year">
              <Calendar size={12} /> {vehicle.year}
            </span>
          )}
          {vehicle.connectorTypeName && (
            <span className="vh-card-chip connector">
              <Plug size={12} /> {vehicle.connectorTypeName}
            </span>
          )}
        </div>

        {/* Points reward bar */}
        <div className="vh-card-reward">
          <Star size={16} />
          <span className="vh-card-reward-num">
            {pointsBalance.toLocaleString()}
          </span>
          <span className="vh-card-reward-text">điểm tích lũy</span>
        </div>

        {/* Action */}
        <button
          className={`vh-card-action ${isActive ? 'deactivate' : 'activate'}`}
          onClick={() => onUpdate(vehicle)}
        >
          {isActive ? <PowerOff size={15} /> : <Power size={15} />}
          {isActive ? 'Ngưng hoạt động' : 'Kích hoạt lại'}
        </button>
      </div>
    </div>
  );
}