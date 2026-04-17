import React from "react";

const CurrentFligth = () => {
  return (
    <>
      <div className="row gx-5 justify-content-between">
        <div className="col-auto">
          <table className="fs-9">
            <tbody>
              <tr>
                <th style={{ width: 70 }} />
                <th />
                <th />
              </tr>
              <tr>
                <td>
                  <h6 className="mb-0 text-body-tertiary">Flight no.</h6>
                </td>
                <td className="text-body-tertiary pe-2">: </td>
                <td>
                  <h6 className="mb-0 text-nowrap fw-semibold text-body-tertiary">
                    FF-SCA001
                  </h6>
                </td>
              </tr>
              <tr>
                <td>
                  <h6 className="mb-0 text-body-tertiary">Model</h6>
                </td>
                <td className="text-body-tertiary pe-2">: </td>
                <td>
                  <h6 className="mb-0 text-nowrap fw-semibold text-body-tertiary">
                    Appa 707-RTX
                  </h6>
                </td>
              </tr>
              <tr>
                <td>
                  <h6 className="mb-0 text-body-tertiary">Velocity</h6>
                </td>
                <td className="text-body-tertiary pe-2">: </td>
                <td>
                  <h6 className="mb-0 text-nowrap fw-semibold text-body-tertiary">
                    450 km/h
                  </h6>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="col-auto">
          <table className="fs-9">
            <tbody>
              <tr>
                <th style={{ width: 70 }} />
                <th />
                <th />
              </tr>
              <tr>
                <td>
                  <h6 className="mb-0 text-body-tertiary">Airline</h6>
                </td>
                <td className="text-body-tertiary pe-2">: </td>
                <td>
                  <h6 className="mb-0 text-nowrap fw-semibold text-primary">
                    YIP YIP
                  </h6>
                </td>
              </tr>
              <tr>
                <td>
                  <h6 className="mb-0 text-body-tertiary">Callsign</h6>
                </td>
                <td className="text-body-tertiary pe-2">: </td>
                <td>
                  <h6 className="mb-0 text-nowrap fw-semibold text-body-tertiary">
                    Skybison1
                  </h6>
                </td>
              </tr>
              <tr>
                <td>
                  <h6 className="mb-0 text-body-tertiary">ETA</h6>
                </td>
                <td className="text-body-tertiary pe-2">: </td>
                <td>
                  <h6 className="mb-0 text-nowrap fw-semibold text-body-tertiary">
                    12 hrs 57 mins
                  </h6>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="d-flex align-items-center gap-2 mt-3">
        <h6 className="mb-0 text-body-tertiary">GRU</h6>
        <div
          className="progress flex-1"
          role="progressbar"
          aria-label="flight-destination-progress"
          aria-valuenow={50}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="progress-bar bg-info overflow-visible"
            style={{ width: "50%" }}
          >
            <span className="fa-solid fa-plane text-info position-absolute end-0" />
          </div>
        </div>
        <h6 className="mb-0 text-body-tertiary">SJC</h6>
      </div>
    </>
  );
};

export default CurrentFligth;
