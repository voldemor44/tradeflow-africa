import { useState } from "react";
import { NavLink } from "react-router";

const shipmentsData = [
  {
    id: "TFA-2025-0045",
    description: "Équipements électroniques – 3 conteneurs 20'",
    origin: "Shanghai, CN",
    destination: "Cotonou, BJ",
    partner: { name: "BESCO Transitaires", initials: "BE" },
    mode: "sea",
    status: { title: "En mer", badge: "info", icon: "anchor" },
    eta: "15 Jan 2025",
    date: "À l'instant",
  },
  {
    id: "TFA-2025-0044",
    description: "Matériaux de construction – vrac 120t",
    origin: "Marseille, FR",
    destination: "Cotonou, BJ",
    partner: { name: "DHL Express Bénin", initials: "DH" },
    mode: "sea",
    status: { title: "En dédouanement", badge: "warning", icon: "clock" },
    eta: "12 Jan 2025",
    date: "À l'instant",
  },
  {
    id: "TFA-2025-0043",
    description: "Produits pharmaceutiques – 2 palettes",
    origin: "Paris, FR",
    destination: "Cotonou, BJ",
    partner: { name: "Air France Cargo", initials: "AF" },
    mode: "air",
    status: { title: "Bloquée", badge: "danger", icon: "x-circle" },
    eta: "08 Jan 2025",
    date: "À l'instant",
  },
  {
    id: "TFA-2025-0042",
    description: "Pièces automobiles – 1 conteneur 40'",
    origin: "Istanbul, TR",
    destination: "Cotonou, BJ",
    partner: { name: "MAERSK Bénin", initials: "MA" },
    mode: "sea",
    status: { title: "Livré", badge: "success", icon: "check" },
    eta: "05 Jan 2025",
    date: "05 Jan, 14:30",
  },
  {
    id: "TFA-2025-0041",
    description: "Textiles et vêtements – 2 conteneurs 20'",
    origin: "Mumbai, IN",
    destination: "Cotonou, BJ",
    partner: { name: "BESCO Transitaires", initials: "BE" },
    mode: "sea",
    status: { title: "Au port", badge: "primary", icon: "map-pin" },
    eta: "03 Jan 2025",
    date: "03 Jan, 09:15",
  },
  {
    id: "TFA-2025-0040",
    description: "Machines industrielles – hors gabarit",
    origin: "Hambourg, DE",
    destination: "Cotonou, BJ",
    partner: { name: "SAGA Transport", initials: "SA" },
    mode: "sea",
    status: { title: "Livré", badge: "success", icon: "check" },
    eta: "28 Déc 2024",
    date: "28 Déc, 11:00",
  },
  {
    id: "TFA-2025-0039",
    description: "Denrées alimentaires – réfrigérées 18t",
    origin: "Dubaï, AE",
    destination: "Cotonou, BJ",
    partner: { name: "Emirates SkyCargo", initials: "EM" },
    mode: "air",
    status: { title: "Livré", badge: "success", icon: "check" },
    eta: "22 Déc 2024",
    date: "22 Déc, 08:45",
  },
  {
    id: "TFA-2025-0038",
    description: "Équipements solaires – 4 conteneurs 40'",
    origin: "Guangzhou, CN",
    destination: "Cotonou, BJ",
    partner: { name: "CMA CGM Bénin", initials: "CM" },
    mode: "sea",
    status: { title: "En mer", badge: "info", icon: "anchor" },
    eta: "20 Jan 2025",
    date: "18 Déc, 10:00",
  },
];

const ModeIcon = ({ mode }) => {
  const icons = { sea: "ship", air: "plane", road: "truck" };
  const labels = { sea: "Maritime", air: "Aérien", road: "Routier" };
  return (
    <span
      className="text-body-tertiary fs-10 d-flex align-items-center gap-1"
      title={labels[mode]}
    >
      <span className={`fas fa-${icons[mode] || "box"}`} />
      <span className="d-none d-xl-inline">{labels[mode]}</span>
    </span>
  );
};

const PartnerAvatar = ({ partner }) => (
  <div className="avatar avatar-l">
    <div className="avatar-name rounded-circle bg-primary-subtle">
      <span className="text-primary fw-bold fs-10">{partner.initials}</span>
    </div>
  </div>
);

const RecentShipmentsTable = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredData = shipmentsData.filter(
    (s) =>
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.partner.name.toLowerCase().includes(search.toLowerCase()) ||
      s.origin.toLowerCase().includes(search.toLowerCase()) ||
      s.destination.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      {/* Toolbar */}
      <div className="row g-2 gy-3 mb-3">
        <div className="col-auto flex-1">
          <div className="search-box">
            <div className="position-relative">
              <input
                className="form-control search-input form-control-sm"
                type="search"
                placeholder="Rechercher un dossier, partenaire, route..."
                aria-label="Rechercher"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <span className="fas fa-search search-box-icon" />
            </div>
          </div>
        </div>
        <div className="col-auto">
          <NavLink
            to="/expeditions"
            className="btn btn-sm btn-phoenix-secondary bg-body-emphasis bg-body-hover me-2"
          >
            Toutes les expéditions
          </NavLink>
          <button
            className="btn btn-sm btn-phoenix-secondary bg-body-emphasis bg-body-hover"
            type="button"
            data-bs-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            <span className="fas fa-ellipsis-h" />
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <a className="dropdown-item" href="#!">Exporter CSV</a>
            </li>
            <li>
              <a className="dropdown-item" href="#!">Exporter PDF</a>
            </li>
            <div className="dropdown-divider" />
            <li>
              <a className="dropdown-item text-danger" href="#!">Archiver la sélection</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive mx-n1 px-1 scrollbar">
        <table className="table fs-9 mb-0 border-top border-translucent">
          <thead>
            <tr>
              <th className="white-space-nowrap fs-9 ps-0 align-middle">
                <div className="form-check mb-0 fs-8">
                  <input className="form-check-input" type="checkbox" />
                </div>
              </th>
              <th className="align-middle" scope="col" style={{ minWidth: 140 }}>
                N° DOSSIER
              </th>
              <th className="align-middle" scope="col" style={{ minWidth: 240 }}>
                MARCHANDISE
              </th>
              <th className="align-middle" scope="col" style={{ minWidth: 180 }}>
                ROUTE
              </th>
              <th className="align-middle" scope="col" style={{ minWidth: 160 }}>
                PARTENAIRE
              </th>
              <th className="align-middle" scope="col" style={{ minWidth: 80 }}>
                MODE
              </th>
              <th className="align-middle text-start ps-5" scope="col">
                STATUT
              </th>
              <th className="align-middle text-end" scope="col" style={{ minWidth: 110 }}>
                ETA
              </th>
              <th className="text-end pe-0 align-middle" scope="col" />
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((shipment) => (
              <tr
                key={shipment.id}
                className="hover-actions-trigger btn-reveal-trigger position-static"
              >
                <td className="fs-9 align-middle ps-0">
                  <div className="form-check mb-0 fs-8">
                    <input className="form-check-input" type="checkbox" />
                  </div>
                </td>
                <td className="align-middle white-space-nowrap">
                  <NavLink
                    className="fw-bold text-primary"
                    to={`/expeditions/${shipment.id}`}
                  >
                    {shipment.id}
                  </NavLink>
                </td>
                <td className="align-middle">
                  <p className="fs-9 fw-semibold text-body-highlight mb-0">
                    {shipment.description}
                  </p>
                </td>
                <td className="align-middle white-space-nowrap">
                  <div className="d-flex flex-column gap-1">
                    <span className="fs-10 text-body-tertiary">
                      <span className="fas fa-arrow-right me-1 text-primary" style={{ fontSize: 9 }} />
                      {shipment.origin}
                    </span>
                    <span className="fs-10 text-body">
                      <span className="fas fa-map-marker-alt me-1 text-success" style={{ fontSize: 9 }} />
                      {shipment.destination}
                    </span>
                  </div>
                </td>
                <td className="align-middle white-space-nowrap">
                  <a className="d-flex align-items-center text-body" href="#!">
                    <PartnerAvatar partner={shipment.partner} />
                    <span className="mb-0 ms-2 fs-9 text-body fw-semibold">
                      {shipment.partner.name}
                    </span>
                  </a>
                </td>
                <td className="align-middle">
                  <ModeIcon mode={shipment.mode} />
                </td>
                <td className="align-middle text-start ps-5">
                  <span
                    className={`badge badge-phoenix fs-10 badge-phoenix-${shipment.status.badge}`}
                  >
                    <span className="badge-label">{shipment.status.title}</span>
                    <span
                      className={`ms-1 fas fa-${shipment.status.icon}`}
                      style={{ fontSize: "12.8px" }}
                    />
                  </span>
                </td>
                <td className="align-middle text-end white-space-nowrap">
                  <h6 className="text-body-highlight mb-0">{shipment.eta}</h6>
                </td>
                <td className="align-middle white-space-nowrap text-end pe-0">
                  <button
                    className="btn btn-sm dropdown-toggle dropdown-caret-none transition-none btn-reveal fs-10"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <span className="fas fa-ellipsis-h fs-10" />
                  </button>
                  <div className="dropdown-menu dropdown-menu-end py-2">
                    <NavLink className="dropdown-item" to={`/expeditions/${shipment.id}`}>
                      Voir le dossier
                    </NavLink>
                    <a className="dropdown-item" href="#!">Modifier</a>
                    <div className="dropdown-divider" />
                    <a className="dropdown-item text-danger" href="#!">Archiver</a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="row align-items-center py-1">
        <div className="col d-flex fs-9">
          <p className="mb-0 d-none d-sm-block me-3 fw-semibold text-body">
            {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, filteredData.length)} sur{" "}
            {filteredData.length}
          </p>
        </div>
        <div className="col-auto d-flex">
          <button
            className="btn btn-link px-1 me-1"
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            <span className="fas fa-chevron-left me-2" />
            Précédent
          </button>
          <button
            className="btn btn-link px-1 ms-1"
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Suivant
            <span className="fas fa-chevron-right ms-2" />
          </button>
        </div>
      </div>
    </>
  );
};

export default RecentShipmentsTable;
