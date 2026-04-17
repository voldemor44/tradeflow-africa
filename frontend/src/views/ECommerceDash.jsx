import React from "react";
import TotalSalesChart from "../components/ecommerce/TotalSalesChart";
import TotalOrdersChart from "../components/ecommerce/TotalOrdersChart";
import NewCustomersChart from "../components/ecommerce/NewCustomersChart";
import TopRegionsTable from "../components/ecommerce/TopRegionsTable";
import ProjectionVsActualChart from "../components/ecommerce/ProjectionVsActualChart";
import ReturningCustomerChart from "../components/ecommerce/ReturningCustomerChart";
import TopCouponsChart from "../components/ecommerce/TopCouponsChart";
import PayingCustomerChart from "../components/ecommerce/PayingCustomerChart";
import LastReviewTable from "../components/ecommerce/LastReviewTable";
import WorldMap from "../components/ecommerce/WorldMap";

const ECommerceDash = () => {
  return (
    <>
      <div className="pb-5">
        <div className="row g-4">
          <div className="col-12 col-xxl-6">
            <div className="mb-8">
              <h2 className="mb-2">Ecommerce Dashboard</h2>
              <h5 className="text-body-tertiary fw-semibold">
                Here’s what’s going on at your business right now
              </h5>
            </div>
            <div className="row align-items-center g-4">
              <div className="col-12 col-md-auto">
                <div className="d-flex align-items-center">
                  <span
                    className="fa-stack"
                    style={{ minHeight: 46, minWidth: 46 }}
                  >
                    <span
                      className="fa-solid fa-square fa-stack-2x dark__text-opacity-50 text-success-light"
                      data-fa-transform="down-4 rotate--10 left-4"
                    />
                    <span
                      className="fa-solid fa-circle fa-stack-2x stack-circle text-stats-circle-success"
                      data-fa-transform="up-4 right-3 grow-2"
                    />
                    <span
                      className="fa-stack-1x fa-solid fa-star text-success"
                      data-fa-transform="shrink-2 up-8 right-6"
                    />
                  </span>
                  <div className="ms-3">
                    <h4 className="mb-0">57 new orders</h4>
                    <p className="text-body-secondary fs-9 mb-0">
                      Awating processing
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-auto">
                <div className="d-flex align-items-center">
                  <span
                    className="fa-stack"
                    style={{ minHeight: 46, minWidth: 46 }}
                  >
                    <span
                      className="fa-solid fa-square fa-stack-2x dark__text-opacity-50 text-warning-light"
                      data-fa-transform="down-4 rotate--10 left-4"
                    />
                    <span
                      className="fa-solid fa-circle fa-stack-2x stack-circle text-stats-circle-warning"
                      data-fa-transform="up-4 right-3 grow-2"
                    />
                    <span
                      className="fa-stack-1x fa-solid fa-pause text-warning"
                      data-fa-transform="shrink-2 up-8 right-6"
                    />
                  </span>
                  <div className="ms-3">
                    <h4 className="mb-0">5 orders</h4>
                    <p className="text-body-secondary fs-9 mb-0">On hold</p>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-auto">
                <div className="d-flex align-items-center">
                  <span
                    className="fa-stack"
                    style={{ minHeight: 46, minWidth: 46 }}
                  >
                    <span
                      className="fa-solid fa-square fa-stack-2x dark__text-opacity-50 text-danger-light"
                      data-fa-transform="down-4 rotate--10 left-4"
                    />
                    <span
                      className="fa-solid fa-circle fa-stack-2x stack-circle text-stats-circle-danger"
                      data-fa-transform="up-4 right-3 grow-2"
                    />
                    <span
                      className="fa-stack-1x fa-solid fa-xmark text-danger"
                      data-fa-transform="shrink-2 up-8 right-6"
                    />
                  </span>
                  <div className="ms-3">
                    <h4 className="mb-0">15 products</h4>
                    <p className="text-body-secondary fs-9 mb-0">
                      Out of stock
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <hr className="bg-body-secondary mb-6 mt-4" />
            <div className="row flex-between-center mb-4 g-3">
              <div className="col-auto">
                <h3>Total sells</h3>
                <p className="text-body-tertiary lh-sm mb-0">
                  Payment received across all channels
                </p>
              </div>
              <div className="col-8 col-sm-4">
                <select
                  className="form-select form-select-sm"
                  id="select-gross-revenue-month"
                >
                  <option>Mar 1 - 31, 2022</option>
                  <option>April 1 - 30, 2022</option>
                  <option>May 1 - 31, 2022</option>
                </select>
              </div>
            </div>

            <div className="echart-total-sales-chart" />
            <TotalSalesChart />
          </div>

          <div className="col-12 col-xxl-6">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h5 className="mb-1">
                          Total orders
                          <span className="badge badge-phoenix badge-phoenix-warning rounded-pill fs-9 ms-2">
                            <span className="badge-label">-6.8%</span>
                          </span>
                        </h5>
                        <h6 className="text-body-tertiary">Last 7 days</h6>
                      </div>
                      <h4>16,247</h4>
                    </div>

                    <div className="d-flex justify-content-center px-4 py-6">
                      <div className="echart-total-orders" />
                      <TotalOrdersChart />
                    </div>

                    <div className="mt-2">
                      <div className="d-flex align-items-center mb-2">
                        <div className="bullet-item bg-primary me-2" />
                        <h6 className="text-body fw-semibold flex-1 mb-0">
                          Completed
                        </h6>
                        <h6 className="text-body fw-semibold mb-0">52%</h6>
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="bullet-item bg-primary-subtle me-2" />
                        <h6 className="text-body fw-semibold flex-1 mb-0">
                          Pending payment
                        </h6>
                        <h6 className="text-body fw-semibold mb-0">48%</h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h5 className="mb-1">
                          New customers
                          <span className="badge badge-phoenix badge-phoenix-warning rounded-pill fs-9 ms-2">
                            <span className="badge-label">+26.5%</span>
                          </span>
                        </h5>
                        <h6 className="text-body-tertiary">Last 7 days</h6>
                      </div>
                      <h4>356</h4>
                    </div>
                    <div className="pb-0 pt-4">
                      <div className="echarts-new-customers" />
                      <NewCustomersChart />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h5 className="mb-2">Top coupons</h5>
                        <h6 className="text-body-tertiary">Last 7 days</h6>
                      </div>
                    </div>
                    <div className="pb-4 pt-3">
                      <TopCouponsChart />
                    </div>
                    <div>
                      <div className="d-flex align-items-center mb-2">
                        <div className="bullet-item bg-primary me-2" />
                        <h6 className="text-body fw-semibold flex-1 mb-0">
                          Percentage discount
                        </h6>
                        <h6 className="text-body fw-semibold mb-0">72%</h6>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <div className="bullet-item bg-primary-lighter me-2" />
                        <h6 className="text-body fw-semibold flex-1 mb-0">
                          Fixed card discount
                        </h6>
                        <h6 className="text-body fw-semibold mb-0">18%</h6>
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="bullet-item bg-info-dark me-2" />
                        <h6 className="text-body fw-semibold flex-1 mb-0">
                          Fixed product discount
                        </h6>
                        <h6 className="text-body fw-semibold mb-0">10%</h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="card h-100">
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h5 className="mb-2">Paying vs non paying</h5>
                        <h6 className="text-body-tertiary">Last 7 days</h6>
                      </div>
                    </div>
                    <div className="d-flex justify-content-center pt-3 flex-1">
                      <PayingCustomerChart />
                    </div>
                    <div className="mt-3">
                      <div className="d-flex align-items-center mb-2">
                        <div className="bullet-item bg-primary me-2" />
                        <h6 className="text-body fw-semibold flex-1 mb-0">
                          Paying customer
                        </h6>
                        <h6 className="text-body fw-semibold mb-0">30%</h6>
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="bullet-item bg-primary-subtle me-2" />
                        <h6 className="text-body fw-semibold flex-1 mb-0">
                          Non-paying customer
                        </h6>
                        <h6 className="text-body fw-semibold mb-0">70%</h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-n4 px-4 mx-lg-n6 px-lg-6 bg-body-emphasis pt-7 border-y">
        <div data-list='{"valueNames":["product","customer","rating","review","time"],"page":6}'>
          <div className="row align-items-end justify-content-between pb-5 g-3">
            <div className="col-auto">
              <h3>Latest reviews</h3>
              <p className="text-body-tertiary lh-sm mb-0">
                Payment received across all channels
              </p>
            </div>
          </div>
          <LastReviewTable />
        </div>
      </div>
      <div className="row gx-6">
        <div className="col-12 col-xl-6">
          <TopRegionsTable />
        </div>

        <WorldMap />
      </div>
      <div className="mx-n4 px-4 mx-lg-n6 px-lg-6 bg-body-emphasis pt-6 pb-9 border-top">
        <div className="row g-6">
          <div className="col-12 col-xl-6">
            <div className="me-xl-4">
              <div>
                <h3>Projection vs actual</h3>
                <p className="mb-1 text-body-tertiary">
                  Actual earnings vs projected earnings
                </p>
              </div>

              <ProjectionVsActualChart />
            </div>
          </div>
          <div className="col-12 col-xl-6">
            <div>
              <h3>Returning customer rate</h3>
              <p className="mb-1 text-body-tertiary">
                Rate of customers returning to your shop over time
              </p>
            </div>

            <ReturningCustomerChart />
          </div>
        </div>
      </div>
    </>
  );
};

export default ECommerceDash;
