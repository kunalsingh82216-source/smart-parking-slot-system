import React, { useEffect, useState } from "react";
import { FaParking, FaCarSide, FaMotorcycle, FaTruck, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";

const SlotView = () => {
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    const storedSlots =
      JSON.parse(localStorage.getItem("parkingSlots")) || [];
    setSlots(storedSlots);
  }, []);

  // Toggle Available/Occupied
  const toggleStatus = (id) => {
    const updatedSlots = slots.map((slot) =>
      slot.id === id
        ? {
            ...slot,
            status:
              slot.status === "Available" ? "Occupied" : "Available",
          }
        : slot
    );

    setSlots(updatedSlots);
    localStorage.setItem("parkingSlots", JSON.stringify(updatedSlots));
  };

  // Delete Slot
  const deleteSlot = (id) => {
    const slot = slots.find((s) => s.id === id);
    if (slot.status === "Occupied") {
      toast.error("Cannot delete occupied slot!");
      return;
    }

    const updatedSlots = slots.filter((s) => s.id !== id);
    setSlots(updatedSlots);
    localStorage.setItem("parkingSlots", JSON.stringify(updatedSlots));
    toast.success("Slot deleted successfully!");
  };

  const availableCount = slots.filter((slot) => slot.status === "Available").length;
  const occupiedCount = slots.filter((slot) => slot.status === "Occupied").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Parking Slot Overview</h1>
        <p className="text-slate-500 mt-1">Click on a slot to toggle status or delete</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100">
          <h2 className="text-3xl font-bold text-slate-800">{slots.length}</h2>
          <p className="text-slate-500 mt-1">Total Slots</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100">
          <h2 className="text-3xl font-bold text-slate-800">{availableCount}</h2>
          <p className="text-slate-500 mt-1">Available Slots</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100">
          <h2 className="text-3xl font-bold text-slate-800">{occupiedCount}</h2>
          <p className="text-slate-500 mt-1">Occupied Slots</p>
        </div>
      </div>

      {/* Slot Grid */}
      {slots.length === 0 ? (
        <div className="bg-white p-10 rounded-3xl shadow text-center">
          <FaParking className="mx-auto text-5xl text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No parking slots added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">

          {slots.map((slot) => (
            <div
              key={slot.id}
              className={`p-4 rounded-2xl shadow-lg text-center transition transform hover:scale-105 relative
                ${slot.status === "Available"
                  ? "bg-green-100 border-2 border-green-500"
                  : "bg-red-100 border-2 border-red-500"
              }`}
            >
              {/* Slot Info */}
              <h2 className="text-xl font-bold text-slate-800">
                {slot.slotNumber} ({slot.floor || "F1"})
              </h2>
              <p className="text-gray-600">{slot.slotType}</p>

              {/* Status Badge */}
              <span
                className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold
                  ${slot.status === "Available"
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {slot.status}
              </span>

              {/* Vehicle Details */}
              {slot.vehicle && (
                <div className="mt-3 bg-white/80 p-2 rounded-xl shadow-inner text-left border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    {slot.slotType === "Car" && <FaCarSide className="text-blue-600" />}
                    {slot.slotType === "Bike" && <FaMotorcycle className="text-green-600" />}
                    {slot.slotType === "Truck" && <FaTruck className="text-orange-600" />}
                    <span className="font-semibold text-slate-700">Vehicle Info</span>
                  </div>
                  <p className="text-slate-600 text-sm"><strong>Number:</strong> {slot.vehicle.vehicleNumber}</p>
                  <p className="text-slate-600 text-sm"><strong>Owner:</strong> {slot.vehicle.ownerName}</p>
                  <p className="text-slate-600 text-sm"><strong>Phone:</strong> {slot.vehicle.phone}</p>
                  <p className="text-slate-600 text-sm"><strong>Entry:</strong> {new Date(slot.vehicle.entryTime).toLocaleString()}</p>
                </div>
              )}

              {/* Delete Button */}
              <button
                onClick={() => deleteSlot(slot.id)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                title="Delete Slot"
              >
                <FaTrash size={14} />
              </button>

              {/* Toggle Slot Click */}
              <button
                onClick={() => toggleStatus(slot.id)}
                className="mt-3 w-full bg-slate-800 text-white py-1 rounded-lg hover:bg-slate-900 transition text-sm"
              >
                Toggle Status
              </button>

            </div>
          ))}

        </div>
      )}

    </div>
  );
};

export default SlotView;