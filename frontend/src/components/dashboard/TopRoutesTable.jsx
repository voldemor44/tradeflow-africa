import { useState } from "react";

const routesData = [
  {
    rank: 1,
    origin: "Chine",
    originFlag: "assets/img/country/china.png",
    destination: "Bénin",
    destinationFlag: "assets/img/country/benin.png",
    shipments: 42,
    shipmentsPercent: "38.5%",
    volume: "1 240 t",
    volumePercent: "41.2%",
    avgCost: "2 850 000",
    avgCostPercent: "39.1%",
    onTime: "88%",
  },
  {
    rank: 2,
    origin: "France",
    originFlag: "assets/img/country/france.png",
    destination: "Bénin",
    destinationFlag: "assets/img/country/benin.png",
    shipments: 28,
    shipmentsPercent: "25.7%",
    volume: "740 t",
    volumePercent: "24.6%",
    avgCost: "1 950 000",
    avgCostPercent: "26.8%",
    onTime: "92%",
  },
  {
    rank: 3,
    origin: "Inde",
    originFlag: "assets/img/country/india.png",
    destination: "Bénin",
    destinationFlag: "assets/img/country/benin.png",
    shipments: 19,
    shipmentsPercent: "17.4%",
    volume: "520 t",
    volumePercent: "17.3%",
    avgCost: "1 620 000",
    avgCostPercent: "22.3%",
    onTime: "79%",
  },
  {
    rank: 4,
    origin: "Turquie",
    originFlag: "assets/img/country/turkey.png",
    destination: "Bénin",
    destinationFlag: "assets/img/country/benin.png",
    shipments: 12,
    shipmentsPercent: "11.0%",
    volume: "310 t",
    volumePercent: "10.3%",
    avgCost: "1 280 000",
    avgCostPercent: "17.6%",
    onTime: "83%",
  },
  {
    rank: 5,
    origin: "Émirats",
    originFlag: "assets/img/country/uae.png",
    destination: "Bénin",
    destinationFlag: "assets/img/country/benin.png",
    shipments: 8,
    shipmentsPercent: "7.3%",
    volume: "190 t",
    volumePercent: "6.3%",
    avgCost: "980 000",
    avgCostPercent: "13.5%",
    onTime: "95%",
  },
];

const TopRoutesTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(routesData.length / itemsPerPage);
  const paginatedData = routesData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <div className="mb-5 mt-7">
        <h3>Top routes par volume</h3>
        <p className="text-body-tertiary">
          Routes générant le plus d'expéditions ce mois-ci
        </p>
      </div>
      <div className="table-responsive scrollbar">
        <table className="table fs-10 mb-0">
          <thead>
            <tr>
              <th
                className="sort border-top border-translucent ps-0 align-middle"
                scope="col"
                style={{ width: "32%" }}
              >
                ROUTE
              </th>
              <th
                className="sort border-top border-translucent align-middle"
                scope="col"
                style={{ width: "17%" }}
              >
                EXPÉDITIONS
              </th>
              <th
                className="sort border-top border-translucent text-end align-middle"
                scope="col"
                style={{ width: "16%" }}
              >
                VOLUME
              </th>
              <th
                className="sort border-top border-translucent text-end align-middle"
                scope="col"
                style={{ width: "20%" }}
              >
                COÛT MOY. (FCFA)
              </th>
              <th
                className="sort border-top border-translucent text-end pe-0 align-middle"
                scope="col"
                style={{ width: "15%" }}
              >
                À L'HEURE
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td />
              <td className="align-middle py-4">
                <h4 className="mb-0 fw-normal">
                  {routesData.reduce((sum, r) => sum + r.shipments, 0)}
                </h4>
              </td>
              <td className="align-middle text-end py-4">
                <h4 className="mb-0 fw-normal">3 000 t</h4>
              </td>
              <td className="align-middle text-end py-4">
                <h4 className="mb-0 fw-normal">1 736 000</h4>
              </td>
              <td className="align-middle text-end py-4 pe-0">
                <h4 className="mb-0 fw-normal">87%</h4>
              </td>
            </tr>
          </tbody>
          <tbody className="list">
            {paginatedData.map((route) => (
              <tr key={route.rank}>
                <td className="white-space-nowrap ps-0" style={{ width: "32%" }}>
                  <div className="d-flex align-items-center">
                    <h6 className="mb-0 me-3">{route.rank}.</h6>
                    <div className="d-flex align-items-center gap-2">
                      <img src={route.originFlag} alt={route.origin} width={20} />
                      <p className="mb-0 text-primary fw-bold fs-9">{route.origin}</p>
                      <span className="text-body-tertiary fs-10">→</span>
                      <img src={route.destinationFlag} alt={route.destination} width={20} />
                      <p className="mb-0 text-body fw-semibold fs-9">{route.destination}</p>
                    </div>
                  </div>
                </td>
                <td className="align-middle" style={{ width: "17%" }}>
                  <h6 className="mb-0">
                    {route.shipments}
                    <span className="text-body-tertiary fw-semibold ms-2">
                      ({route.shipmentsPercent})
                    </span>
                  </h6>
                </td>
                <td className="align-middle text-end" style={{ width: "17%" }}>
                  <h6 className="mb-0">
                    {route.volume}
                    <span className="text-body-tertiary fw-semibold ms-2">
                      ({route.volumePercent})
                    </span>
                  </h6>
                </td>
                <td className="align-middle text-end" style={{ width: "17%" }}>
                  <h6 className="mb-0">
                    {route.avgCost}
                    <span className="text-body-tertiary fw-semibold ms-2">
                      ({route.avgCostPercent})
                    </span>
                  </h6>
                </td>
                <td className="align-middle text-end pe-0" style={{ width: "15%" }}>
                  <h6
                    className={`mb-0 fw-bold ${
                      parseInt(route.onTime) >= 90
                        ? "text-success"
                        : parseInt(route.onTime) >= 80
                        ? "text-warning"
                        : "text-danger"
                    }`}
                  >
                    {route.onTime}
                  </h6>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="row align-items-center py-1">
        <div className="pagination d-none" />
        <div className="col d-flex fs-9">
          <p className="mb-0 d-none d-sm-block me-3 fw-semibold text-body">
            {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, routesData.length)} sur{" "}
            {routesData.length}
          </p>
        </div>
        <div className="col-auto d-flex">
          <button
            className="btn btn-link px-1 me-1"
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            <span className="fas fa-chevron-left me-2" />
            Précédent
          </button>
          <button
            className="btn btn-link px-1 ms-1"
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Suivant
            <span className="fas fa-chevron-right ms-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopRoutesTable;
