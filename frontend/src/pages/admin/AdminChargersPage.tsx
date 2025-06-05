import { Calendar, ChevronUp, ChevronDown, History, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import ReservationModalAdmin from "../../components/ReservationModalAdmin";

type SortDirection = "asc" | "desc" | null;
type SortField =
  | "id"
  | "slotLabel"
  | "stationLocation"
  | "chargingType"
  | "totalCost"
  | "createdAt"
  | "state"
  | null;

interface ReservationResponseDTO {
  id: number;
  stationLocation: string;
  slotLabel: string;
  chargingType: string;
  totalCost: number;
  state: string;
  createdAt: string;
  startTime: string;
  userName: string;
  userEmail: string;
}

const BASEURL = "http://localhost:8081";

const AdminReservationsPage = () => {
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [reservations, setReservations] = useState<ReservationResponseDTO[]>(
    []
  );

  const [selectedReservation, setSelectedReservation] =
    useState<ReservationResponseDTO | null>(null);

  useEffect(() => {
    fetch(`${BASEURL}/api/reservations/all`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setReservations(data))
      .catch((err) => console.error("Error fetching reservations", err));
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortedData = (data: ReservationResponseDTO[]) => {
    if (!sortField || !sortDirection) return data;
    return [...data].sort((a, b) => {
      const valA = a[sortField as keyof ReservationResponseDTO];
      const valB = b[sortField as keyof ReservationResponseDTO];
      if (valA == null || valB == null) return 0;
      if (typeof valA === "string" && typeof valB === "string") {
        return sortDirection === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }
      return 0;
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return (
        <ChevronUp className="opacity-0 group-hover:opacity-50" size={16} />
      );
    return sortDirection === "asc" ? (
      <ChevronUp className="text-blue-700" size={16} />
    ) : (
      <ChevronDown className="text-blue-700" size={16} />
    );
  };

  const statusStyles = {
    ACTIVE: "bg-green-100 text-green-800",
    CANCELED: "bg-yellow-100 text-yellow-800",
    COMPLETED: "bg-gray-100 text-gray-800",
  } as const;

  const activeReservations = reservations.filter((r) => r.state === "ACTIVE");
  const historyReservations = reservations.filter((r) => r.state !== "ACTIVE");

  const ReservationTable = ({ data }: { data: ReservationResponseDTO[] }) => {
    const sorted = getSortedData(data);
    const paginated = sorted.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-center">
              <th
                className="px-6 py-4 text-sm text-gray-500 cursor-pointer group"
                onClick={() => handleSort("id")}
              >
                ID <SortIcon field="id" />
              </th>
              <th className="px-6 py-4 text-sm text-gray-500 text-center group">
                Slot{" "}
                <span className="opacity-0">
                  <ChevronUp size={16} />
                </span>
              </th>
              <th
                className="px-6 py-4 text-sm text-gray-500 cursor-pointer group"
                onClick={() => handleSort("stationLocation")}
              >
                Station <SortIcon field="stationLocation" />
              </th>
              <th
                className="px-6 py-4 text-sm text-gray-500 cursor-pointer group"
                onClick={() => handleSort("state")}
              >
                Status <SortIcon field="state" />
              </th>
              <th
                className="px-6 py-4 text-sm text-gray-500 cursor-pointer group"
                onClick={() => handleSort("chargingType")}
              >
                Charging Type <SortIcon field="chargingType" />
              </th>
              <th
                className="px-6 py-4 text-sm text-gray-500 cursor-pointer group"
                onClick={() => handleSort("totalCost")}
              >
                Cost <SortIcon field="totalCost" />
              </th>
              <th className="px-6 py-4 text-sm text-gray-500 text-center group">
                Reservation Day{" "}
                <span className="opacity-0">
                  <ChevronUp size={16} />
                </span>
              </th>
              <th className="px-6 py-4 text-sm text-gray-500 text-center group">
                Actions{" "}
                <span className="opacity-0">
                  <ChevronUp size={16} />
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-center">
            {paginated.length > 0 ? (
              paginated.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{r.id}</td>
                  <td className="px-6 py-4">{r.slotLabel}</td>
                  <td className="px-6 py-4">{r.stationLocation}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`badge ${
                        statusStyles[r.state as keyof typeof statusStyles] || ""
                      }`}
                    >
                      {r.state}
                    </span>
                  </td>
                  <td className="px-6 py-4">{r.chargingType}</td>
                  <td className="px-6 py-4">€{r.totalCost.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    {r.startTime
                      ? new Date(r.startTime).toLocaleDateString("pt-PT")
                      : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedReservation(r)}
                      className="text-blue-700 hover:text-blue-800 flex items-center gap-1 justify-center"
                    >
                      <Eye size={16} />
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-6 text-center text-gray-500">
                  No reservations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const totalPages = Math.max(1, Math.ceil(reservations.length / itemsPerPage));

  const Pagination = () => (
    <div className="mt-4 flex items-center justify-between px-4">
      <div className="text-sm text-gray-600">
        Showing {itemsPerPage} per page
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-3 py-1">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 mt-8">
      <div className="card w-full">
        <div className="flex items-center gap-3 mb-6">
          <Calendar size={24} className="text-blue-700" />
          <h2 className="text-2xl font-bold text-gray-800">
            Active Reservations
          </h2>
        </div>
        <ReservationTable data={activeReservations} />
      </div>

      <div className="card w-full mt-8">
        <div className="flex items-center gap-3 mb-6">
          <History size={24} className="text-blue-700" />
          <h2 className="text-2xl font-bold text-gray-800">
            Reservation History
          </h2>
        </div>
        <ReservationTable data={historyReservations} />
        <Pagination />
      </div>

      {selectedReservation && (
        <ReservationModalAdmin
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
        />
      )}
    </div>
  );
};

export default AdminReservationsPage;
