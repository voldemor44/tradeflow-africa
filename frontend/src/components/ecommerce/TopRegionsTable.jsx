import { useEffect, useRef } from "react";

const TopRegionsTable = () => {
  return (
    <div>
      <div className="mb-5 mt-7">
        <h3>Top regions by revenue</h3>
        <p className="text-body-tertiary">
          Where you generated most of the revenue
        </p>
      </div>
      <div className="table-responsive scrollbar">
        <table className="table fs-10 mb-0">
          <thead>
            <tr>
              <th
                className="sort border-top border-translucent ps-0 align-middle"
                scope="col"
                data-sort="country"
                style={{ width: "32%" }}
              >
                COUNTRY
              </th>
              <th
                className="sort border-top border-translucent align-middle"
                scope="col"
                data-sort="users"
                style={{ width: "17%" }}
              >
                USERS
              </th>
              <th
                className="sort border-top border-translucent text-end align-middle"
                scope="col"
                data-sort="transactions"
                style={{ width: "16%" }}
              >
                TRANSACTIONS
              </th>
              <th
                className="sort border-top border-translucent text-end align-middle"
                scope="col"
                data-sort="revenue"
                style={{ width: "20%" }}
              >
                REVENUE
              </th>
              <th
                className="sort border-top border-translucent text-end pe-0 align-middle"
                scope="col"
                data-sort="conv-rate"
                style={{ width: "17%" }}
              >
                CONV. RATE
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td />
              <td className="align-middle py-4">
                <h4 className="mb-0 fw-normal">377,620</h4>
              </td>
              <td className="align-middle text-end py-4">
                <h4 className="mb-0 fw-normal">236</h4>
              </td>
              <td className="align-middle text-end py-4">
                <h4 className="mb-0 fw-normal">$15,758</h4>
              </td>
              <td className="align-middle text-end py-4 pe-0">
                <h4 className="mb-0 fw-normal">10.32%</h4>
              </td>
            </tr>
          </tbody>
          <tbody className="list" id="table-regions-by-revenue">
            <tr>
              <td
                className="white-space-nowrap ps-0 country"
                style={{ width: "32%" }}
              >
                <div className="d-flex align-items-center">
                  <h6 className="mb-0 me-3">1.</h6>
                  <a href="#!">
                    <div className="d-flex align-items-center">
                      <img src="assets/img/country/india.png" alt width={24} />
                      <p className="mb-0 ps-3 text-primary fw-bold fs-9">
                        India
                      </p>
                    </div>
                  </a>
                </div>
              </td>
              <td className="align-middle users" style={{ width: "17%" }}>
                <h6 className="mb-0">
                  92896
                  <span className="text-body-tertiary fw-semibold ms-2">
                    (41.6%)
                  </span>
                </h6>
              </td>
              <td
                className="align-middle text-end transactions"
                style={{ width: "17%" }}
              >
                <h6 className="mb-0">
                  67
                  <span className="text-body-tertiary fw-semibold ms-2">
                    (34.3%)
                  </span>
                </h6>
              </td>
              <td
                className="align-middle text-end revenue"
                style={{ width: "17%" }}
              >
                <h6 className="mb-0">
                  $7560
                  <span className="text-body-tertiary fw-semibold ms-2">
                    (36.9%)
                  </span>
                </h6>
              </td>
              <td
                className="align-middle text-end pe-0 conv-rate"
                style={{ width: "17%" }}
              >
                <h6>14.01%</h6>
              </td>
            </tr>
            <tr>
              <td
                className="white-space-nowrap ps-0 country"
                style={{ width: "32%" }}
              >
                <div className="d-flex align-items-center">
                  <h6 className="mb-0 me-3">2.</h6>
                  <a href="#!">
                    <div className="d-flex align-items-center">
                      <img src="assets/img/country/china.png" alt width={24} />
                      <p className="mb-0 ps-3 text-primary fw-bold fs-9">
                        China
                      </p>
                    </div>
                  </a>
                </div>
              </td>
              <td className="align-middle users" style={{ width: "17%" }}>
                <h6 className="mb-0">
                  50496
                  <span className="text-body-tertiary fw-semibold ms-2">
                    (32.8%)
                  </span>
                </h6>
              </td>
              <td
                className="align-middle text-end transactions"
                style={{ width: "17%" }}
              >
                <h6 className="mb-0">
                  54
                  <span className="text-body-tertiary fw-semibold ms-2">
                    (23.8%)
                  </span>
                </h6>
              </td>
              <td
                className="align-middle text-end revenue"
                style={{ width: "17%" }}
              >
                <h6 className="mb-0">
                  $6532
                  <span className="text-body-tertiary fw-semibold ms-2">
                    (26.5%)
                  </span>
                </h6>
              </td>
              <td
                className="align-middle text-end pe-0 conv-rate"
                style={{ width: "17%" }}
              >
                <h6>23.56%</h6>
              </td>
            </tr>
            <tr>
              <td
                className="white-space-nowrap ps-0 country"
                style={{ width: "32%" }}
              >
                <div className="d-flex align-items-center">
                  <h6 className="mb-0 me-3">3.</h6>
                  <a href="#!">
                    <div className="d-flex align-items-center">
                      <img src="assets/img/country/usa.png" alt width={24} />
                      <p className="mb-0 ps-3 text-primary fw-bold fs-9">USA</p>
                    </div>
                  </a>
                </div>
              </td>
              <td className="align-middle users" style={{ width: "17%" }}>
                <h6 className="mb-0">
                  45679
                  <span className="text-body-tertiary fw-semibold ms-2">
                    (24.3%)
                  </span>
                </h6>
              </td>
              <td
                className="align-middle text-end transactions"
                style={{ width: "17%" }}
              >
                <h6 className="mb-0">
                  35
                  <span className="text-body-tertiary fw-semibold ms-2">
                    (19.7%)
                  </span>
                </h6>
              </td>
              <td
                className="align-middle text-end revenue"
                style={{ width: "17%" }}
              >
                <h6 className="mb-0">
                  $5432
                  <span className="text-body-tertiary fw-semibold ms-2">
                    (16.9%)
                  </span>
                </h6>
              </td>
              <td
                className="align-middle text-end pe-0 conv-rate"
                style={{ width: "17%" }}
              >
                <h6>10.23%</h6>
              </td>
            </tr>
            <tr>
              <td
                className="white-space-nowrap ps-0 country"
                style={{ width: "32%" }}
              >
                <div className="d-flex align-items-center">
                  <h6 className="mb-0 me-3">4.</h6>
                  <a href="#!">
                    <div className="d-flex align-items-center">
                      <img
                        src="assets/img/country/south-korea.png"
                        alt
                        width={24}
                      />
                      <p className="mb-0 ps-3 text-primary fw-bold fs-9">
                        South Korea
                      </p>
                    </div>
                  </a>
                </div>
              </td>
              <td className="align-middle users" style={{ width: "17%" }}>
                <h6 className="mb-0">
                  36453
                  <span className="text-body-tertiary fw-semibold ms-2">
                    (19.7%)
                  </span>
                </h6>
              </td>
              <td
                className="align-middle text-end transactions"
                style={{ width: "17%" }}
              >
                <h6 className="mb-0">
                  22
                  <span className="text-body-tertiary fw-semibold ms-2">
                    (9.54%)
                  </span>
                </h6>
              </td>
              <td
                className="align-middle text-end revenue"
                style={{ width: "17%" }}
              >
                <h6 className="mb-0">
                  $4673
                  <span className="text-body-tertiary fw-semibold ms-2">
                    (11.6%)
                  </span>
                </h6>
              </td>
              <td
                className="align-middle text-end pe-0 conv-rate"
                style={{ width: "17%" }}
              >
                <h6>8.85%</h6>
              </td>
            </tr>
            <tr>
              <td
                className="white-space-nowrap ps-0 country"
                style={{ width: "32%" }}
              >
                <div className="d-flex align-items-center">
                  <h6 className="mb-0 me-3">5.</h6>
                  <a href="#!">
                    <div className="d-flex align-items-center">
                      <img
                        src="assets/img/country/vietnam.png"
                        alt
                        width={24}
                      />
                      <p className="mb-0 ps-3 text-primary fw-bold fs-9">
                        Vietnam
                      </p>
                    </div>
                  </a>
                </div>
              </td>
              <td className="align-middle users" style={{ width: "17%" }}>
                <h6 className="mb-0">
                  15007
                  <span className="text-body-tertiary fw-semibold ms-2">
                    (11.9%)
                  </span>
                </h6>
              </td>
              <td
                className="align-middle text-end transactions"
                style={{ width: "17%" }}
              >
                <h6 className="mb-0">
                  17
                  <span className="text-body-tertiary fw-semibold ms-2">
                    (6.91%)
                  </span>
                </h6>
              </td>
              <td
                className="align-middle text-end revenue"
                style={{ width: "17%" }}
              >
                <h6 className="mb-0">
                  $2456
                  <span className="text-body-tertiary fw-semibold ms-2">
                    (10.2%)
                  </span>
                </h6>
              </td>
              <td
                className="align-middle text-end pe-0 conv-rate"
                style={{ width: "17%" }}
              >
                <h6>6.01%</h6>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="row align-items-center py-1">
        <div className="pagination d-none" />
        <div className="col d-flex fs-9">
          <p
            className="mb-0 d-none d-sm-block me-3 fw-semibold text-body"
            data-list-info="data-list-info"
          />
        </div>
        <div className="col-auto d-flex">
          <button
            className="btn btn-link px-1 me-1"
            type="button"
            title="Previous"
            data-list-pagination="prev"
          >
            <span className="fas fa-chevron-left me-2" />
            Previous
          </button>
          <button
            className="btn btn-link px-1 ms-1"
            type="button"
            title="Next"
            data-list-pagination="next"
          >
            Next
            <span className="fas fa-chevron-right ms-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopRegionsTable;
