import React from "react";
import CurrentFligth from "../components/travel_agency/CurrentFligth";
import FligthSlider from "../components/travel_agency/FligthSlider";
import FlightMap from "../components/travel_agency/FlightMap";
import BookingValueChart from "../components/travel_agency/BookingValueChart";
import CommissionChart from "../components/travel_agency/CommissionChart";
import CancelBookingChart from "../components/travel_agency/CancelBookingChart";
import FinancialActivitySessions from "../components/travel_agency/FinancialActivitySessions";

const TravelAgencyDash = () => {
  return (
    <>
      <div className="row mb-4 mb-xl-6 mb-xxl-4 gy-3 justify-content-between">
        <div className="col-auto">
          <h2 className="mb-0 text-body-emphasis">Travel Agency</h2>
        </div>
        <div className="col-auto">
          <div className="d-flex gap-3">
            <a className="btn btn-phoenix-primary" href="#!">
              <span className="fa-solid fa-plus me-2" />
              New Package
            </a>
            <a className="btn btn-primary px-4 px-sm-11" href="#!">
              <span className="fa-regular fa-calendar-days me-2" />
              Book Now
            </a>
          </div>
        </div>
      </div>

      <div className="row gx-3">
        <div className="col-xxl-7">
          <div className="row gx-7 pe-xxl-3">
            <div className="col-12 col-xl-5 col-xxl-12">
              <div className="row g-0">
                <div className="col-6 col-xl-12 col-xxl-6 border-bottom border-end border-end-xl-0 border-end-xxl pb-4 pt-4 pt-xl-0 pt-xxl-4 pe-4 pe-sm-5 pe-xl-0 pe-xxl-5">
                  <h5 className="text-body mb-4">Total Value</h5>
                  <div className="d-md-flex flex-between-center">
                    <BookingValueChart />
                    <div className="mt-4 mt-md-0">
                      <h3 className="text-body-highlight mb-2">$2,345.00</h3>
                      <span className="badge badge-phoenix badge-phoenix-primary me-2 fs-10">
                        <span className="fa-solid fa-plus me-1" />
                        23.35%
                      </span>
                      <span className="fs-9 text-body-secondary d-block d-sm-inline mt-1">
                        From last month
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-xl-12 col-xxl-6 border-bottom py-4 ps-4 ps-sm-5 ps-xl-0 ps-xxl-5">
                  <h5 className="text-body mb-4">Booked Flights</h5>
                  <div className="d-md-flex flex-between-center">
                    <div className="d-md-flex align-items-center gap-2 order-sm-0 order-md-1">
                      <span
                        className="fa-solid fa-cloud-bolt fs-5 text-warning-light dark__text-opacity-75"
                        data-bs-theme="light"
                      />
                      <div className="d-flex d-md-block gap-2 align-items-center mt-1 mt-md-0">
                        <p className="fs-9 mb-0 mb-md-2 text-body-tertiary text-nowrap">
                          Rain Chances
                        </p>
                        <h4 className="text-body-highlight mb-0">95%</h4>
                      </div>
                    </div>
                    <div className="mt-3 mt-md-0">
                      <h3 className="text-body-highlight mb-2">1,432</h3>
                      <span className="badge badge-phoenix badge-phoenix-success me-2 fs-10">
                        <span className="fa-solid fa-plus me-1" />
                        3.98%
                      </span>
                      <span className="fs-9 text-body-secondary text-nowrap d-block d-sm-inline mt-1">
                        From last month
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-xl-12 col-xxl-6 border-bottom-xl border-bottom-xxl-0 border-end border-end-xl-0 border-end-xxl py-4 pe-4 pe-sm-5 pe-xl-0 pe-xxl-5">
                  <h5 className="text-body mb-4">Commission</h5>
                  <div className="d-md-flex flex-between-center">
                    <CommissionChart />
                    <div className="mt-3 mt-md-0">
                      <h3 className="text-body-highlight mb-2">$3,339.00</h3>
                      <span className="badge badge-phoenix badge-phoenix-danger me-2 fs-10">
                        <span className="fa-solid fa-minus me-1" />
                        12.21%
                      </span>
                      <span className="fs-9 text-body-secondary d-block d-sm-inline mt-1">
                        From last month
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-xl-12 col-xxl-6 py-4 ps-4 ps-sm-5 ps-xl-0 ps-xxl-5">
                  <h5 className="text-body mb-4">Canceled Booking</h5>
                  <div className="d-md-flex flex-between-center">
                    <CancelBookingChart />
                    <div className="mt-3 mt-md-0">
                      <h3 className="text-body-highlight mb-2">120.00</h3>
                      <span className="badge badge-phoenix badge-phoenix-danger me-2 fs-10">
                        <span className="fa-solid fa-plus me-1" />
                        5.76%
                      </span>
                      <span className="fs-9 text-body-secondary d-block d-sm-inline mt-1">
                        From last month
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <FinancialActivitySessions />
          </div>
        </div>
        <div className="col-xxl-5">
          <div className="row g-3">
            <div className="col-12 col-md-6 col-xxl-12">
              <div
                className="card h-100"
                data-list='{"valueNames":["country","users","status"],"page":4}'
              >
                <div className="card-header border-0 d-flex justify-content-between align-items-start">
                  <div>
                    <h3 className="text-body-highlight">Visitors</h3>
                    <p className="mb-0 text-body-tertiary">
                      Users across countries
                    </p>
                  </div>
                  <div className="dropdown">
                    <button
                      className="btn btn-sm btn-phoenix-secondary bg-body-emphasis bg-body-hover action-btn"
                      type="button"
                      data-bs-toggle="dropdown"
                      data-boundary="window"
                      aria-haspopup="true"
                      aria-expanded="false"
                      data-bs-reference="parent"
                    >
                      <span
                        className="fas fa-ellipsis-h"
                        data-fa-transform="shrink-2"
                      />
                    </button>
                    <div className="dropdown-menu dropdown-menu-end">
                      <a className="dropdown-item" href="#">
                        Action
                      </a>
                      <a className="dropdown-item" href="#">
                        Another action
                      </a>
                      <a className="dropdown-item" href="#">
                        Something else here
                      </a>
                    </div>
                  </div>
                </div>
                <div className="card-body py-0">
                  <h4 className="d-flex align-items-center gap-2 text-body-highlight mb-3">
                    <span
                      className="real-time-user"
                      data-countup='{"endValue":119}'
                    >
                      0
                    </span>
                    <span className="fs-9 fw-normal">User per second</span>
                  </h4>
                  <div
                    className="echart-country-wise-visitors"
                    style={{ height: 43, width: "100%" }}
                  />
                  <div className="table-responsive scrollbar mt-3">
                    <table className="table fs-10 mb-0">
                      <thead>
                        <tr>
                          <th
                            className="sort ps-0 align-middle"
                            data-sort="country"
                            style={{ minWidth: 100 }}
                          >
                            COUNTRY NAME
                          </th>
                          <th
                            className="sort align-middle"
                            data-sort="users"
                            style={{ minWidth: 115 }}
                          >
                            USERS
                          </th>
                          <th
                            className="sort text-end align-middle"
                            data-sort="status"
                          >
                            STATUS
                          </th>
                        </tr>
                      </thead>
                      <tbody className="list" id="table-country-wise-visitors">
                        <tr>
                          <td className="py-2 white-space-nowrap ps-0 country">
                            <a
                              className="d-flex align-items-center text-primary py-md-1 py-xxl-0"
                              href="#!"
                            >
                              <img
                                src="../assets/img/country/india-2.png"
                                alt
                                width={40}
                              />
                              <p className="mb-0 ps-3 fw-bold fs-9">India</p>
                            </a>
                          </td>
                          <td className="py-2 align-middle users">
                            <h6>
                              92,896
                              <span className="text-body-tertiary fw-semibold ms-2">
                                (41.6%)
                              </span>
                            </h6>
                          </td>
                          <td className="py-2 align-middle text-end status">
                            <span className="badge badge-phoenix fs-10 badge-phoenix-info">
                              <span className="fa-solid fa-plus me-1" />
                              15.21%
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 white-space-nowrap ps-0 country">
                            <a
                              className="d-flex align-items-center text-primary py-md-1 py-xxl-0"
                              href="#!"
                            >
                              <img
                                src="../assets/img/country/china-2.png"
                                alt
                                width={40}
                              />
                              <p className="mb-0 ps-3 fw-bold fs-9">China</p>
                            </a>
                          </td>
                          <td className="py-2 align-middle users">
                            <h6>
                              50,496
                              <span className="text-body-tertiary fw-semibold ms-2">
                                (32.8%)
                              </span>
                            </h6>
                          </td>
                          <td className="py-2 align-middle text-end status">
                            <span className="badge badge-phoenix fs-10 badge-phoenix-warning">
                              <span className="fa-solid fa-plus me-1" />
                              05.21%
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 white-space-nowrap ps-0 country">
                            <a
                              className="d-flex align-items-center text-primary py-md-1 py-xxl-0"
                              href="#!"
                            >
                              <img
                                src="../assets/img/country/usa-2.png"
                                alt
                                width={40}
                              />
                              <p className="mb-0 ps-3 fw-bold fs-9">USA</p>
                            </a>
                          </td>
                          <td className="py-2 align-middle users">
                            <h6>
                              45,679
                              <span className="text-body-tertiary fw-semibold ms-2">
                                (24.3%)
                              </span>
                            </h6>
                          </td>
                          <td className="py-2 align-middle text-end status">
                            <span className="badge badge-phoenix fs-10 badge-phoenix-primary">
                              <span className="fa-solid fa-plus me-1" />
                              22.12%
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="card-footer pt-3 border-0">
                  <div className="d-flex align-items-center">
                    <div className="pagination d-none" />
                    <p
                      className="mb-0 d-none d-sm-block me-3 fw-semibold text-body"
                      data-list-info="data-list-info"
                    />
                    <a className="fw-bold fs-9 ms-auto" href="#!">
                      View all
                      <span
                        className="fas fa-angle-right ms-1"
                        data-fa-transform="down-1"
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-xxl-12">
              <div className="card h-100">
                <div className="card-header border-0 pb-2 d-flex justify-content-between align-items-start">
                  <div>
                    <h3 className="text-body-highlight">Holidays</h3>
                    <p className="mb-sm-0 text-body-tertiary">
                      Holidays next month
                    </p>
                  </div>
                  <a
                    className="btn btn-sm btn-phoenix-secondary d-flex align-items-center w-max-content"
                    href="#!"
                  >
                    <span className="text-nowrap">Calender</span>
                    <span className="fa-solid fa-chevron-right ms-2 fs-10" />
                  </a>
                </div>
                <div className="card-body">
                  <div
                    className="echart-holidays-next-month"
                    style={{ height: "100%", minHeight: 300, width: "100%" }}
                  />
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="card mb-3">
                <div
                  className="bg-holder bg-card"
                  style={{
                    backgroundImage:
                      "url(../assets/img/spot-illustrations/39.png)",
                    backgroundPosition: "bottom right 0px",
                    backgroundSize: "auto",
                  }}
                />
                <div className="card-body z-5">
                  <div>
                    <h3 className="text-body-highlight mb-3">
                      Phoenix integrations
                    </h3>
                    <p className="text-body-tertiary mb-4 w-75 w-xl-100">
                      Phoenix improves efficiency instantly and effortlessly
                      <br className="d-none d-xxl-block" /> by allowing easy
                      &amp; simple connection{" "}
                      <br className="d-none d-xl-block" /> to other popular
                      programs
                    </p>
                    <a className="btn btn-sm btn-phoenix-primary" href="#!">
                      <span className="fa-solid fa-link me-1"> </span>Connect
                      Now
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-5">
        <div className="col-xl-5 col-xxl-7">
          <div className="card h-xxl-100">
            <div className="card-header pb-3">
              <div className="row justify-content-between g-3">
                <div className="col-auto">
                  <h3 className="text-body-highlight">Gross Profit</h3>
                  <p className="mb-0">Annual income according to the board</p>
                </div>
                <div className="col-auto">
                  <select className="form-select form-select-sm">
                    <option>Last Fiscal Year</option>
                    <option>Last Calendar year</option>
                    <option>Last Quarter</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="row align-items-center h-100 gy-5">
                <div className="col-12 col-md-auto col-xl-12 col-xxl-auto order-md-1 order-xl-0 order-xxl-1 px-md-8 px-xl-6">
                  <div
                    className="echart-gross-profit mx-auto mt-3 mt-md-0 mt-xl-3 mt-xxl-0"
                    style={{ width: 250, height: 250 }}
                  />
                </div>
                <div className="col-12 col-md-auto col-xl-12 col-xxl-auto flex-1 h-md-100">
                  <div className="d-flex flex-column justify-content-between h-md-100 h-xl-auto h-xxl-100">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex gap-2">
                        <div
                          className="bullet-item bg-primary-light"
                          data-bs-theme="light"
                        />
                        <div>
                          <h6 className="mb-0 text-body fw-semibold mb-2">
                            Flight
                          </h6>
                          <h5 className="mb-0 text-body">$162,791,400</h5>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2 text-primary">
                        <span
                          className="fw-bold"
                          data-feather="trending-up"
                          style={{ width: 24, height: 24 }}
                        />
                        <p className="mb-0 fw-bold">15.50%</p>
                      </div>
                    </div>
                    <hr />
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex gap-2">
                        <div
                          className="bullet-item bg-info-light"
                          data-bs-theme="light"
                        />
                        <div>
                          <h6 className="mb-0 text-body fw-semibold mb-2">
                            Flight (Package)
                          </h6>
                          <h5 className="mb-0 text-body">$135,659,500</h5>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2 text-danger">
                        <span
                          className="fw-bold"
                          data-feather="trending-down"
                          style={{ width: 24, height: 24 }}
                        />
                        <p className="mb-0 fw-bold">11.09%</p>
                      </div>
                    </div>
                    <hr />
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex gap-2">
                        <div
                          className="bullet-item bg-warning-light"
                          data-bs-theme="light"
                        />
                        <div>
                          <h6 className="mb-0 text-body fw-semibold mb-2">
                            Hotel
                          </h6>
                          <h5 className="mb-0 text-body">$271,319,000</h5>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2 text-success">
                        <span
                          className="fw-bold"
                          data-feather="trending-up"
                          style={{ width: 24, height: 24 }}
                        />
                        <p className="mb-0 fw-bold">29.98%</p>
                      </div>
                    </div>
                    <hr />
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex gap-2">
                        <div
                          className="bullet-item bg-success-light"
                          data-bs-theme="light"
                        />
                        <div>
                          <h6 className="mb-0 text-body fw-semibold mb-2">
                            Hotel (Package)
                          </h6>
                          <h5 className="mb-0 text-body">$162,791,400</h5>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2 text-warning">
                        <span
                          className="fw-bold"
                          data-feather="trending-up"
                          style={{ width: 24, height: 24 }}
                        />
                        <p className="mb-0 fw-bold">03.90%</p>
                      </div>
                    </div>
                    <hr className="d-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-7 col-xxl-5">
          <div className="card h-100">
            <div className="card-header pb-3 d-sm-flex d-xl-block d-xxl-flex justify-content-between align-items-start">
              <div>
                <h3 className="text-body-highlight">Bookings</h3>
                <p className="mb-0">Completed and canceled bookings</p>
              </div>
              <select
                className="form-select form-select-sm pe-9 w-auto mt-3 mt-sm-0 mt-xl-3 mt-xxl-0"
                data-booking-options="data-booking-options"
              >
                <option value={0}>Hotel</option>
                <option value={1}>Flight</option>
                <option value={2}>Trip</option>
              </select>
            </div>
            <div className="card-body">
              <div
                className="echart-bookings"
                style={{ height: "100%", minHeight: 322, width: "100%" }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-n4 px-4 mx-lg-n6 px-lg-6 pb-9 bg-body-emphasis border-top">
        <div data-list='{"valueNames":["flightNo","vendor","weather","route","destination","status","time"],"page":4}'>
          <div className="row gx-0 gy-3 align-items-center py-4">
            <div className="col-xl-auto">
              <h3 className="mb-0">Flights </h3>
            </div>
            <div className="col-auto flex-1">
              <div className="d-flex flex-between-center">
                <div className="d-flex align-items-center">
                  <div className="search-box ms-xl-6 w-auto">
                    <form className="position-relative">
                      <input
                        className="form-control search-input search"
                        type="search"
                        placeholder="Search by Flight no."
                        aria-label="Search"
                      />
                      <span className="fas fa-search search-box-icon" />
                    </form>
                  </div>
                  <button className="btn btn-phoenix-secondary px-3 ms-2 me-3">
                    <span
                      className="fa-solid fa-filter text-body-secondary"
                      data-fa-transform="down-2"
                    />
                  </button>
                </div>
                <div className="d-flex align-items-center">
                  <div className="pagination d-none" />
                  <p
                    className="mb-0 d-none d-md-block me-3 fw-semibold text-body text-nowrap"
                    data-list-info="data-list-info"
                  />
                  <div className="d-none d-sm-block">
                    <a
                      className="fw-semibold text-nowrap"
                      href="#!"
                      data-list-view="*"
                    >
                      View all
                      <span
                        className="fas fa-angle-right ms-1"
                        data-fa-transform="down-1"
                      />
                    </a>
                    <a
                      className="fw-semibold d-none text-nowrap"
                      href="#!"
                      data-list-view="less"
                    >
                      View Less
                    </a>
                  </div>
                  <button
                    className="btn btn-phoenix-primary px-3 me-1 ms-sm-4"
                    type="button"
                    title="Previous"
                    data-list-pagination="prev"
                  >
                    <span
                      className="fas fa-chevron-left"
                      data-fa-transform="down-1"
                    />
                  </button>
                  <button
                    className="btn btn-phoenix-primary px-3"
                    type="button"
                    title="Next"
                    data-list-pagination="next"
                  >
                    <span
                      className="fas fa-chevron-right"
                      data-fa-transform="down-1"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="table-responsive scrollbar mx-n1 px-1 mb-4">
            <table className="table fs-9 mb-0 border-top border-translucent">
              <thead>
                <tr>
                  <th className="white-space-nowrap px-0 py-1">
                    <div className="form-check mb-0 fs-8">
                      <input
                        className="form-check-input"
                        id="checkbox-bulk-flights-select"
                        type="checkbox"
                        data-bulk-select='{"body":"table-flights-body"}'
                      />
                    </div>
                  </th>
                  <th
                    className="sort white-space-nowrap align-middle text-body-tertiary ps-0"
                    scope="col"
                    data-sort="flightNo"
                  >
                    FLIGHTS NO.
                  </th>
                  <th
                    className="sort align-middle text-body-tertiary"
                    scope="col"
                    data-sort="vendor"
                    style={{ width: 170 }}
                  >
                    VENDOR
                  </th>
                  <th
                    className="sort text-start align-middle text-body-tertiary"
                    scope="col"
                    data-sort="weather"
                    style={{ width: 250 }}
                  >
                    WEATHER
                  </th>
                  <th
                    className="sort align-middle text-body-tertiary"
                    scope="col"
                    data-sort="route"
                    style={{ width: 180 }}
                  >
                    ROUTE
                  </th>
                  <th
                    className="sort align-middle text-body-tertiary"
                    scope="col"
                    style={{ minWidth: 280 }}
                    data-sort="destination"
                  >
                    DESTINATION
                  </th>
                  <th
                    className="sort text-end align-middle text-body-tertiary"
                    scope="col"
                    data-sort="status"
                    style={{ minWidth: 120 }}
                  >
                    STATUS
                  </th>
                  <th
                    className="sort align-middle text-end text-body-tertiary"
                    scope="col"
                    data-sort="time"
                    style={{ minWidth: 200 }}
                  >
                    TIME
                  </th>
                  <th className="text-end pe-0" scope="col" />
                </tr>
              </thead>
              <tbody className="list" id="table-flights-body">
                <tr>
                  <td className="fs-9 align-middle px-0">
                    <div className="form-check mb-0 fs-8">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        data-bulk-select-row='{"flightNo":"#24349","vendor":{"image":"/img/brands/phoenix-firelines.png","name":"Phoenix Firelines"},"route":{"from":{"flag":"/img/country/usa.png","airport":"LAX"},"to":{"flag":"/img/country/canada.png","airport":"YVR"}},"destination":{"currentPosition":"180 km, 00h:15m ago","target":"955 km, in 01h:25m","percent":25},"weather":{"temperature":15,"weather":"Stormy","icon":"fa-solid fa-cloud-bolt","color":"text-body-tertiary"},"time":{"time":"08:26 PM","date":"Sunday, Nov 06, 2022"},"status":{"label":"Delayed","type":"warning"}}'
                      />
                    </div>
                  </td>
                  <td className="align-middle flightNo ps-0">
                    <a className="fw-bold" href="#!">
                      #24349
                    </a>
                  </td>
                  <td className="align-middle vendor pe-5">
                    <a className="d-flex align-items-center gap-2" href="#!">
                      <img
                        src="../assets/img/brands/phoenix-firelines.png"
                        alt
                        width={32}
                      />
                      <h6 className="mb-0 text-primary fw-semibold text-nowrap">
                        Phoenix Firelines
                      </h6>
                    </a>
                  </td>
                  <td className="align-middle weather pe-5">
                    <div className="d-flex align-items-center">
                      <span className="fa-solid fa-temperature-quarter me-2 text-info" />
                      <p className="mb-0 text-body-tertiary me-3">15°C</p>
                      <span className="me-2 fa-solid fa-cloud-bolt text-body-tertiary" />
                      <p className="mb-0 text-body-tertiary">Stormy</p>
                    </div>
                  </td>
                  <td className="align-middle route pe-5">
                    <div className="d-flex align-items-center gap-2">
                      <img src="../assets/img/country/usa.png" alt width={16} />
                      <p className="mb-0 fw-semibold text-bold">LAX</p>
                      <span className="fa-solid fa-arrow-right text-body-tertiary mx-1" />
                      <p className="mb-0 fw-semibold text-bold">YVR</p>
                      <img
                        src="../assets/img/country/canada.png"
                        alt
                        width={16}
                      />
                    </div>
                  </td>
                  <td className="align-middle destination pe-5 pe-xxl-7">
                    <div
                      className="progress overflow-visible"
                      role="progressbar"
                      aria-label="flight-progress-bar"
                      aria-valuenow={25}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      style={{ height: 2 }}
                    >
                      <div
                        className="progress-bar overflow-visible position-relative bg-info-light rounded"
                        style={{ width: "25%" }}
                      >
                        <span className="fa-solid fa-plane text-info position-absolute end-0" />
                      </div>
                    </div>
                    <div className="d-flex justify-content-between mt-2">
                      <p className="mb-0 fs-10 text-body-tertiary">
                        180 km, 00h:15m ago
                      </p>
                      <p className="mb-0 fs-10 text-body-tertiary">
                        955 km, in 01h:25m
                      </p>
                    </div>
                  </td>
                  <td className="status align-middle text-end">
                    <span className="badge badge-phoenix fs-10 badge-phoenix-warning">
                      Delayed
                    </span>
                  </td>
                  <td className="align-middle text-end time">
                    <div className="d-flex justify-content-end align-items-center gap-2 mb-2">
                      <span className="fa-regular fa-clock text-body"> </span>
                      <span className="text-body fw-semibold">08:26 PM</span>
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                      <span
                        className="text-body"
                        data-feather="calendar"
                        style={{ width: 16, height: 16 }}
                      />
                      <span className="text-body fw-semibold">
                        Sunday, Nov 06, 2022
                      </span>
                    </div>
                  </td>
                  <td className="align-middle text-end">
                    <div className="btn-reveal-trigger">
                      <button
                        className="btn btn-sm ms-auto dropdown-toggle dropdown-caret-none transition-none d-flex btn-reveal"
                        type="button"
                        data-bs-toggle="dropdown"
                        data-boundary="window"
                        aria-haspopup="true"
                        aria-expanded="false"
                        data-bs-reference="parent"
                      >
                        <span className="fas fa-ellipsis-h" />
                      </button>
                      <div className="dropdown-menu dropdown-menu-end">
                        <a className="dropdown-item" href="#!">
                          Track flight
                        </a>
                        <a className="dropdown-item" href="#!">
                          Download
                        </a>
                        <a className="dropdown-item" href="#!">
                          Report abuse
                        </a>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="fs-9 align-middle px-0">
                    <div className="form-check mb-0 fs-8">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        data-bulk-select-row='{"flightNo":"#23421","vendor":{"image":"/img/brands/qatar-airways.png","name":"Qatar Airways"},"route":{"from":{"flag":"/img/country/denmark.png","airport":"EBJ"},"to":{"flag":"/img/country/south-korea.png","airport":"CDG"}},"destination":{"currentPosition":"600 km, 02h:15m ago","target":"1,200 km, in 02h:25m","percent":60},"weather":{"temperature":28,"weather":"Sunny","icon":"fa-solid fa-sun","color":"text-warning"},"time":{"time":"07:23 PM","date":"Monday, Nov 05, 2022"},"status":{"label":"On Time","type":"primary"}}'
                      />
                    </div>
                  </td>
                  <td className="align-middle flightNo ps-0">
                    <a className="fw-bold" href="#!">
                      #23421
                    </a>
                  </td>
                  <td className="align-middle vendor pe-5">
                    <a className="d-flex align-items-center gap-2" href="#!">
                      <img
                        src="../assets/img/brands/qatar-airways.png"
                        alt
                        width={32}
                      />
                      <h6 className="mb-0 text-primary fw-semibold text-nowrap">
                        Qatar Airways
                      </h6>
                    </a>
                  </td>
                  <td className="align-middle weather pe-5">
                    <div className="d-flex align-items-center">
                      <span className="fa-solid fa-temperature-quarter me-2 text-danger" />
                      <p className="mb-0 text-body-tertiary me-3">28°C</p>
                      <span className="me-2 fa-solid fa-sun text-warning" />
                      <p className="mb-0 text-body-tertiary">Sunny</p>
                    </div>
                  </td>
                  <td className="align-middle route pe-5">
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src="../assets/img/country/denmark.png"
                        alt
                        width={16}
                      />
                      <p className="mb-0 fw-semibold text-bold">EBJ</p>
                      <span className="fa-solid fa-arrow-right text-body-tertiary mx-1" />
                      <p className="mb-0 fw-semibold text-bold">CDG</p>
                      <img
                        src="../assets/img/country/south-korea.png"
                        alt
                        width={16}
                      />
                    </div>
                  </td>
                  <td className="align-middle destination pe-5 pe-xxl-7">
                    <div
                      className="progress overflow-visible"
                      role="progressbar"
                      aria-label="flight-progress-bar"
                      aria-valuenow={60}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      style={{ height: 2 }}
                    >
                      <div
                        className="progress-bar overflow-visible position-relative bg-info-light rounded"
                        style={{ width: "60%" }}
                      >
                        <span className="fa-solid fa-plane text-info position-absolute end-0" />
                      </div>
                    </div>
                    <div className="d-flex justify-content-between mt-2">
                      <p className="mb-0 fs-10 text-body-tertiary">
                        600 km, 02h:15m ago
                      </p>
                      <p className="mb-0 fs-10 text-body-tertiary">
                        1,200 km, in 02h:25m
                      </p>
                    </div>
                  </td>
                  <td className="status align-middle text-end">
                    <span className="badge badge-phoenix fs-10 badge-phoenix-primary">
                      On Time
                    </span>
                  </td>
                  <td className="align-middle text-end time">
                    <div className="d-flex justify-content-end align-items-center gap-2 mb-2">
                      <span className="fa-regular fa-clock text-body"> </span>
                      <span className="text-body fw-semibold">07:23 PM</span>
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                      <span
                        className="text-body"
                        data-feather="calendar"
                        style={{ width: 16, height: 16 }}
                      />
                      <span className="text-body fw-semibold">
                        Monday, Nov 05, 2022
                      </span>
                    </div>
                  </td>
                  <td className="align-middle text-end">
                    <div className="btn-reveal-trigger">
                      <button
                        className="btn btn-sm ms-auto dropdown-toggle dropdown-caret-none transition-none d-flex btn-reveal"
                        type="button"
                        data-bs-toggle="dropdown"
                        data-boundary="window"
                        aria-haspopup="true"
                        aria-expanded="false"
                        data-bs-reference="parent"
                      >
                        <span className="fas fa-ellipsis-h" />
                      </button>
                      <div className="dropdown-menu dropdown-menu-end">
                        <a className="dropdown-item" href="#!">
                          Track flight
                        </a>
                        <a className="dropdown-item" href="#!">
                          Download
                        </a>
                        <a className="dropdown-item" href="#!">
                          Report abuse
                        </a>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="fs-9 align-middle px-0">
                    <div className="form-check mb-0 fs-8">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        data-bulk-select-row='{"flightNo":"#23132","vendor":{"image":"/img/brands/jal.png","name":"Japan Airlines"},"route":{"from":{"flag":"/img/country/china.png","airport":"GOT"},"to":{"flag":"/img/country/usa.png","airport":"BCN"}},"destination":{"currentPosition":"500 km, 00h:56m ago","target":"3,455 km, in 03h:25m","percent":25},"weather":{"temperature":22,"weather":"Wind","icon":"fa-solid fa-wind","color":"text-info"},"time":{"time":"07:23 PM","date":"Monday, Nov 05, 2022"},"status":{"label":"Departure","type":"success"}}'
                      />
                    </div>
                  </td>
                  <td className="align-middle flightNo ps-0">
                    <a className="fw-bold" href="#!">
                      #23132
                    </a>
                  </td>
                  <td className="align-middle vendor pe-5">
                    <a className="d-flex align-items-center gap-2" href="#!">
                      <img src="../assets/img/brands/jal.png" alt width={32} />
                      <h6 className="mb-0 text-primary fw-semibold text-nowrap">
                        Japan Airlines
                      </h6>
                    </a>
                  </td>
                  <td className="align-middle weather pe-5">
                    <div className="d-flex align-items-center">
                      <span className="fa-solid fa-temperature-quarter me-2 text-info" />
                      <p className="mb-0 text-body-tertiary me-3">22°C</p>
                      <span className="me-2 fa-solid fa-wind text-info" />
                      <p className="mb-0 text-body-tertiary">Wind</p>
                    </div>
                  </td>
                  <td className="align-middle route pe-5">
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src="../assets/img/country/china.png"
                        alt
                        width={16}
                      />
                      <p className="mb-0 fw-semibold text-bold">GOT</p>
                      <span className="fa-solid fa-arrow-right text-body-tertiary mx-1" />
                      <p className="mb-0 fw-semibold text-bold">BCN</p>
                      <img src="../assets/img/country/usa.png" alt width={16} />
                    </div>
                  </td>
                  <td className="align-middle destination pe-5 pe-xxl-7">
                    <div
                      className="progress overflow-visible"
                      role="progressbar"
                      aria-label="flight-progress-bar"
                      aria-valuenow={25}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      style={{ height: 2 }}
                    >
                      <div
                        className="progress-bar overflow-visible position-relative bg-info-light rounded"
                        style={{ width: "25%" }}
                      >
                        <span className="fa-solid fa-plane text-info position-absolute end-0" />
                      </div>
                    </div>
                    <div className="d-flex justify-content-between mt-2">
                      <p className="mb-0 fs-10 text-body-tertiary">
                        500 km, 00h:56m ago
                      </p>
                      <p className="mb-0 fs-10 text-body-tertiary">
                        3,455 km, in 03h:25m
                      </p>
                    </div>
                  </td>
                  <td className="status align-middle text-end">
                    <span className="badge badge-phoenix fs-10 badge-phoenix-success">
                      Departure
                    </span>
                  </td>
                  <td className="align-middle text-end time">
                    <div className="d-flex justify-content-end align-items-center gap-2 mb-2">
                      <span className="fa-regular fa-clock text-body"> </span>
                      <span className="text-body fw-semibold">07:23 PM</span>
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                      <span
                        className="text-body"
                        data-feather="calendar"
                        style={{ width: 16, height: 16 }}
                      />
                      <span className="text-body fw-semibold">
                        Monday, Nov 05, 2022
                      </span>
                    </div>
                  </td>
                  <td className="align-middle text-end">
                    <div className="btn-reveal-trigger">
                      <button
                        className="btn btn-sm ms-auto dropdown-toggle dropdown-caret-none transition-none d-flex btn-reveal"
                        type="button"
                        data-bs-toggle="dropdown"
                        data-boundary="window"
                        aria-haspopup="true"
                        aria-expanded="false"
                        data-bs-reference="parent"
                      >
                        <span className="fas fa-ellipsis-h" />
                      </button>
                      <div className="dropdown-menu dropdown-menu-end">
                        <a className="dropdown-item" href="#!">
                          Track flight
                        </a>
                        <a className="dropdown-item" href="#!">
                          Download
                        </a>
                        <a className="dropdown-item" href="#!">
                          Report abuse
                        </a>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="fs-9 align-middle px-0">
                    <div className="form-check mb-0 fs-8">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        data-bulk-select-row='{"flightNo":"#22267","vendor":{"image":"/img/brands/emirates.png","name":"Emirate"},"route":{"from":{"flag":"/img/country/qatar.png","airport":"DIA"},"to":{"flag":"/img/country/norway.png","airport":"OSL"}},"destination":{"currentPosition":"00 km, 00h:00m ago","target":"00 km, in 00h:00m","percent":0},"weather":{"temperature":5,"weather":"Heavy rain","icon":"fa-solid fa-cloud-showers-heavy","color":"text-danger"},"time":{"time":"07:23 PM","date":"Monday, Nov 05, 2022"},"status":{"label":"Cancelled","type":"danger"}}'
                      />
                    </div>
                  </td>
                  <td className="align-middle flightNo ps-0">
                    <a className="fw-bold" href="#!">
                      #22267
                    </a>
                  </td>
                  <td className="align-middle vendor pe-5">
                    <a className="d-flex align-items-center gap-2" href="#!">
                      <img
                        src="../assets/img/brands/emirates.png"
                        alt
                        width={32}
                      />
                      <h6 className="mb-0 text-primary fw-semibold text-nowrap">
                        Emirate
                      </h6>
                    </a>
                  </td>
                  <td className="align-middle weather pe-5">
                    <div className="d-flex align-items-center">
                      <span className="fa-solid fa-temperature-quarter me-2 text-info" />
                      <p className="mb-0 text-body-tertiary me-3">5°C</p>
                      <span className="me-2 fa-solid fa-cloud-showers-heavy text-danger" />
                      <p className="mb-0 text-body-tertiary">Heavy rain</p>
                    </div>
                  </td>
                  <td className="align-middle route pe-5">
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src="../assets/img/country/qatar.png"
                        alt
                        width={16}
                      />
                      <p className="mb-0 fw-semibold text-bold">DIA</p>
                      <span className="fa-solid fa-arrow-right text-body-tertiary mx-1" />
                      <p className="mb-0 fw-semibold text-bold">OSL</p>
                      <img
                        src="../assets/img/country/norway.png"
                        alt
                        width={16}
                      />
                    </div>
                  </td>
                  <td className="align-middle destination pe-5 pe-xxl-7">
                    <div
                      className="progress overflow-visible"
                      role="progressbar"
                      aria-label="flight-progress-bar"
                      aria-valuenow={0}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      style={{ height: 2 }}
                    >
                      <div
                        className="progress-bar overflow-visible position-relative bg-info-light rounded"
                        style={{ width: "0%" }}
                      />
                    </div>
                    <div className="d-flex justify-content-between mt-2">
                      <p className="mb-0 fs-10 text-body-quaternary">
                        00 km, 00h:00m ago
                      </p>
                      <p className="mb-0 fs-10 text-body-quaternary">
                        00 km, in 00h:00m
                      </p>
                    </div>
                  </td>
                  <td className="status align-middle text-end">
                    <span className="badge badge-phoenix fs-10 badge-phoenix-danger">
                      Cancelled
                    </span>
                  </td>
                  <td className="align-middle text-end time">
                    <div className="d-flex justify-content-end align-items-center gap-2 mb-2">
                      <span className="fa-regular fa-clock text-body"> </span>
                      <span className="text-body fw-semibold">07:23 PM</span>
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                      <span
                        className="text-body"
                        data-feather="calendar"
                        style={{ width: 16, height: 16 }}
                      />
                      <span className="text-body fw-semibold">
                        Monday, Nov 05, 2022
                      </span>
                    </div>
                  </td>
                  <td className="align-middle text-end">
                    <div className="btn-reveal-trigger">
                      <button
                        className="btn btn-sm ms-auto dropdown-toggle dropdown-caret-none transition-none d-flex btn-reveal"
                        type="button"
                        data-bs-toggle="dropdown"
                        data-boundary="window"
                        aria-haspopup="true"
                        aria-expanded="false"
                        data-bs-reference="parent"
                      >
                        <span className="fas fa-ellipsis-h" />
                      </button>
                      <div className="dropdown-menu dropdown-menu-end">
                        <a className="dropdown-item" href="#!">
                          Track flight
                        </a>
                        <a className="dropdown-item" href="#!">
                          Download
                        </a>
                        <a className="dropdown-item" href="#!">
                          Report abuse
                        </a>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="fs-9 align-middle px-0">
                    <div className="form-check mb-0 fs-8">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        data-bulk-select-row='{"flightNo":"#41242","vendor":{"image":"/img/brands/emirates.png","name":"Emirate"},"route":{"from":{"flag":"/img/country/qatar.png","airport":"DIA"},"to":{"flag":"/img/country/norway.png","airport":"OSL"}},"destination":{"currentPosition":"26512 km, .02h:56m ago","target":"3,455 km, in 03h:25m","percent":75},"weather":{"temperature":5,"weather":"Heavy rain","icon":"fa-solid fa-cloud-showers-heavy","color":"text-danger"},"time":{"time":"07:23 PM","date":"Monday, Nov 05, 2022"},"status":{"label":"On Time","type":"primary"}}'
                      />
                    </div>
                  </td>
                  <td className="align-middle flightNo ps-0">
                    <a className="fw-bold" href="#!">
                      #41242
                    </a>
                  </td>
                  <td className="align-middle vendor pe-5">
                    <a className="d-flex align-items-center gap-2" href="#!">
                      <img
                        src="../assets/img/brands/emirates.png"
                        alt
                        width={32}
                      />
                      <h6 className="mb-0 text-primary fw-semibold text-nowrap">
                        Emirate
                      </h6>
                    </a>
                  </td>
                  <td className="align-middle weather pe-5">
                    <div className="d-flex align-items-center">
                      <span className="fa-solid fa-temperature-quarter me-2 text-info" />
                      <p className="mb-0 text-body-tertiary me-3">5°C</p>
                      <span className="me-2 fa-solid fa-cloud-showers-heavy text-danger" />
                      <p className="mb-0 text-body-tertiary">Heavy rain</p>
                    </div>
                  </td>
                  <td className="align-middle route pe-5">
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src="../assets/img/country/qatar.png"
                        alt
                        width={16}
                      />
                      <p className="mb-0 fw-semibold text-bold">DIA</p>
                      <span className="fa-solid fa-arrow-right text-body-tertiary mx-1" />
                      <p className="mb-0 fw-semibold text-bold">OSL</p>
                      <img
                        src="../assets/img/country/norway.png"
                        alt
                        width={16}
                      />
                    </div>
                  </td>
                  <td className="align-middle destination pe-5 pe-xxl-7">
                    <div
                      className="progress overflow-visible"
                      role="progressbar"
                      aria-label="flight-progress-bar"
                      aria-valuenow={75}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      style={{ height: 2 }}
                    >
                      <div
                        className="progress-bar overflow-visible position-relative bg-info-light rounded"
                        style={{ width: "75%" }}
                      >
                        <span className="fa-solid fa-plane text-info position-absolute end-0" />
                      </div>
                    </div>
                    <div className="d-flex justify-content-between mt-2">
                      <p className="mb-0 fs-10 text-body-tertiary">
                        26512 km, .02h:56m ago
                      </p>
                      <p className="mb-0 fs-10 text-body-tertiary">
                        3,455 km, in 03h:25m
                      </p>
                    </div>
                  </td>
                  <td className="status align-middle text-end">
                    <span className="badge badge-phoenix fs-10 badge-phoenix-primary">
                      On Time
                    </span>
                  </td>
                  <td className="align-middle text-end time">
                    <div className="d-flex justify-content-end align-items-center gap-2 mb-2">
                      <span className="fa-regular fa-clock text-body"> </span>
                      <span className="text-body fw-semibold">07:23 PM</span>
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                      <span
                        className="text-body"
                        data-feather="calendar"
                        style={{ width: 16, height: 16 }}
                      />
                      <span className="text-body fw-semibold">
                        Monday, Nov 05, 2022
                      </span>
                    </div>
                  </td>
                  <td className="align-middle text-end">
                    <div className="btn-reveal-trigger">
                      <button
                        className="btn btn-sm ms-auto dropdown-toggle dropdown-caret-none transition-none d-flex btn-reveal"
                        type="button"
                        data-bs-toggle="dropdown"
                        data-boundary="window"
                        aria-haspopup="true"
                        aria-expanded="false"
                        data-bs-reference="parent"
                      >
                        <span className="fas fa-ellipsis-h" />
                      </button>
                      <div className="dropdown-menu dropdown-menu-end">
                        <a className="dropdown-item" href="#!">
                          Track flight
                        </a>
                        <a className="dropdown-item" href="#!">
                          Download
                        </a>
                        <a className="dropdown-item" href="#!">
                          Report abuse
                        </a>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mapbox-container">
            <FlightMap />
            <FligthSlider />
            <div className="flight-desc-card p-3 bg-body-emphasis rounded-3">
              <CurrentFligth />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TravelAgencyDash;
