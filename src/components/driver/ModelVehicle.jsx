import { Calendar, Plug, Zap } from "lucide-react";

export default function ModelVehicle({ model }) {
  return (
    <div className="av-model-card">
      {model.imageUrl && (
        <img
          src={model.imageUrl}
          alt={model.model}
          className="av-model-img"
        />
      )}
      <h4 className="av-model-name">{model.model}</h4>
      <div className="av-model-specs">
        <span className="av-model-spec">
          <Calendar size={11} style={{ verticalAlign: "-1px", marginRight: 3 }} />
          {model.year}
        </span>
        <span className="av-model-spec">
          <Plug size={11} style={{ verticalAlign: "-1px", marginRight: 3 }} />
          {model.connectorTypeDisplayName}
        </span>
        <span className="av-model-spec">
          <Zap size={11} style={{ verticalAlign: "-1px", marginRight: 3 }} />
          {model.connectorDefaultMaxPowerKW} kW
        </span>
      </div>
    </div>
  );
}