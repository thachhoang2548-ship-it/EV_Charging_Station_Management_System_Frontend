import Card from "react-bootstrap/Card";
import classCss from "../../assets/css/Main.module.css";

export default function VehicleCard({ vehicle, onUpdate }) {
    const isActive = vehicle.vehicleStatus === "ACTIVE";

    // ✅ FIX: pointsBalance fallback an toàn
    const pointsBalance =
        Number.isFinite(Number(vehicle?.pointsBalance))
            ? Number(vehicle.pointsBalance)
            : 0;

    return (
        <Card key={vehicle.vehicleId} style={{ width: "18rem" }}>
            <Card.Body>
                <Card.Title>{vehicle.modelName}</Card.Title>

                <Card.Text>
                    Biển số: {vehicle.licensePlate}
                    <br />
                    Hãng xe: {vehicle.brand}
                    <br />
                    Năm sản xuất: {vehicle?.year}
                    <br />
                    Loại cổng sạc: {vehicle.connectorTypeName}
                    <br />
                    {/* ✅ ADD: points balance */}
                    Điểm tích lũy:{" "}
                    <b style={{ color: "#20b2aa" }}>{pointsBalance}</b>
                </Card.Text>

                <button
                    className={classCss.button}
                    onClick={() => onUpdate(vehicle)}
                    style={{
                        backgroundColor: isActive ? "#dc3545" : "#28a745",
                        borderColor: isActive ? "#dc3545" : "#28a745",
                    }}
                >
                    {isActive ? "Ngưng hoạt động" : "Hoạt động trở lại"}
                </button>
            </Card.Body>
        </Card>
    );
}