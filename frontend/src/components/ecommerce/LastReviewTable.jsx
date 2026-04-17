import { useState } from "react";

const reviewsData = [
  {
    id: 1,
    product: "Fitbit Sense Advanced Smartwatch with Tools fo...",
    productImage: "assets/img/products/60x60/1.png",
    customer: { name: "Richard Dawkins", avatar: null, initials: "R" },
    rating: 5,
    review:
      "This Fitbit is fantastic! I was trying to be in better shape and needed some motivation, so I decided to treat myself to a new Fitbit.",
    status: { title: "Approved", badge: "success", icon: "check" },
    time: "Just now",
  },
  {
    id: 2,
    product: "iPhone 13 pro max-Pacific Blue-128GB storage",
    productImage: "assets/img/products/60x60/2.png",
    customer: {
      name: "Ashley Garrett",
      avatar: "assets/img/team/40x40/59.webp",
    },
    rating: 3,
    review:
      "The order was delivered ahead of schedule. To give us additional time, you should leave the packaging sealed with plastic.",
    status: { title: "Approved", badge: "success", icon: "check" },
    time: "Just now",
  },
  {
    id: 3,
    product: "Apple MacBook Pro 13 inch-M1-8/256GB-space",
    productImage: "assets/img/products/60x60/3.png",
    customer: {
      name: "Woodrow Burton",
      avatar: "assets/img/team/40x40/58.webp",
    },
    rating: 4.5,
    review:
      "It's a Mac, after all. Once you've gone Mac, there's no going back. My first Mac lasted over nine years, and this is my second.",
    status: { title: "Pending", badge: "warning", icon: "clock" },
    time: "Just now",
  },
  {
    id: 4,
    product: 'Apple iMac 24" 4K Retina Display M1 8 Core CPU...',
    productImage: "assets/img/products/60x60/4.png",
    customer: {
      name: "Eric McGee",
      avatar: "assets/img/team/40x40/avatar.webp",
      isPlaceholder: true,
    },
    rating: 3,
    review:
      "Personally, I like the minimalist style, but I wouldn't choose it if I were searching for a computer that I would use frequently. It's...",
    seeMore: true,
    status: { title: "Pending", badge: "warning", icon: "clock" },
    time: "Nov 09, 3:23 AM",
  },
  {
    id: 5,
    product: "Razer Kraken v3 x Wired 7.1 Surroung Sound Gam...",
    productImage: "assets/img/products/60x60/5.png",
    customer: {
      name: "Kim Carroll",
      avatar: "assets/img/team/40x40/avatar.webp",
      isPlaceholder: true,
    },
    rating: 4,
    review:
      "It performs exactly as expected. There are three of these in the family.",
    status: { title: "Pending", badge: "warning", icon: "clock" },
    time: "Nov 09, 2:15 PM",
  },
  {
    id: 6,
    product: "PlayStation 5 DualSense Wireless Controller",
    productImage: "assets/img/products/60x60/6.png",
    customer: {
      name: "Barbara Lucas",
      avatar: "assets/img/team/40x40/57.webp",
    },
    rating: 4,
    review:
      "The controller is quite comfy for me. Despite its increased size, the controller still fits well in my hands.",
    status: { title: "Approved", badge: "success", icon: "check" },
    time: "Nov 08, 8:53 AM",
  },
  {
    id: 7,
    product: "2021 Apple 12.9-inch iPad Pro (Wi‑Fi, 128GB) -...",
    productImage: "assets/img/products/60x60/7.png",
    customer: {
      name: "Ansolo Lazinatov",
      avatar: "assets/img/team/40x40/3.webp",
    },
    rating: 4.5,
    review:
      "The response time and service I received when contacted the designers were Phenomenal!",
    status: { title: "Pending", badge: "warning", icon: "clock" },
    time: "Nov 07, 9:00 PM",
  },
  {
    id: 8,
    product: "Amazon Basics Matte Black Wired Keyboard - US ...",
    productImage: "assets/img/products/60x60/8.png",
    customer: { name: "Emma watson", avatar: "assets/img/team/40x40/26.webp" },
    rating: 3,
    review:
      "I have started using this theme in the last week and it has really impressed me very much, the support is second to none.",
    status: { title: "Pending", badge: "warning", icon: "clock" },
    time: "Nov 07, 11:20 AM",
  },
  {
    id: 9,
    product: "Amazon Basics Mesh, Mid-Back, Swivel Office De...",
    productImage: "assets/img/products/60x60/9.png",
    customer: {
      name: "Rowen Atkinson",
      avatar: "assets/img/team/40x40/29.webp",
    },
    rating: 5,
    review:
      "The best experience we could hope for. Customer service team is amazing and the quality of their products is unsurpassed. Great theme ...",
    seeMore: true,
    status: { title: "Approved", badge: "success", icon: "check" },
    time: "Nov 07, 2:00 PM",
  },
  {
    id: 10,
    product: "Apple Magic Mouse (Wireless, Rechargable) - Si...",
    productImage: "assets/img/products/60x60/10.png",
    customer: { name: "Anthony Hopkins", avatar: null, initials: "A" },
    rating: 4,
    review:
      "This template has allowed me to convert my existing web app into a great looking, easy to use UI in less than 2 weeks. Very easy to us...",
    seeMore: true,
    status: { title: "Approved", badge: "success", icon: "check" },
    time: "Nov 06, 8:00 AM",
  },
  {
    id: 11,
    product: "Echo Dot (4th Gen) _ Smart speaker with Alexa ...",
    productImage: "assets/img/products/60x60/11.png",
    customer: {
      name: "Jennifer Schramm",
      avatar: "assets/img/team/40x40/8.webp",
    },
    rating: 4.5,
    review:
      "The theme is really beautiful and the support answer very quickly and is friendly. Buy it, you will not regret it.",
    status: { title: "Pending", badge: "warning", icon: "clock" },
    time: "Nov 05, 4:00 AM",
  },
  {
    id: 12,
    product: "HORI Racing Wheel Apex for PlayStation 4_3, an...",
    productImage: "assets/img/products/60x60/12.png",
    customer: {
      name: "Raymond Mims",
      avatar: "assets/img/team/40x40/avatar.webp",
      isPlaceholder: true,
    },
    rating: 4,
    review:
      "As others mentioned, the team behind this theme is super responsive. I sent a message during the weekend, fully expecting a response a...",
    seeMore: true,
    status: { title: "Approved", badge: "success", icon: "check" },
    time: "Nov 04, 6:53 PM",
  },
  {
    id: 13,
    product: "Nintendo Switch with Neon Blue and Neon Red Jo...",
    productImage: "assets/img/products/60x60/13.png",
    customer: {
      name: "Michael Jenkins",
      avatar: "assets/img/team/40x40/9.webp",
    },
    rating: 5,
    review:
      "I had a bit of a hard time at first but after I contacted the team they were able to help me set up the theme. It's really good and I ...",
    seeMore: true,
    status: { title: "Pending", badge: "warning", icon: "clock" },
    time: "Nov 04, 12:00 PM",
  },
  {
    id: 14,
    product: "Oculus Rift S PC-Powered VR Gaming Headset",
    productImage: "assets/img/products/60x60/14.png",
    customer: {
      name: "Kristine Cadena",
      avatar: "assets/img/team/40x40/avatar.webp",
      isPlaceholder: true,
    },
    rating: 5,
    review:
      "Excellent. All my doubts were answered by the team quickly. I highly recommend it.",
    status: { title: "Pending", badge: "warning", icon: "clock" },
    time: "Nov 03, 8:53 AM",
  },
  {
    id: 15,
    product: "Sony X85J 75 Inch Sony 4K Ultra HD LED Smart G...",
    productImage: "assets/img/products/60x60/15.png",
    customer: {
      name: "Suzanne Martinez",
      avatar: "assets/img/team/40x40/24.webp",
    },
    rating: 3.5,
    review:
      "This theme is great. Clean and easy to understand. Perfect for those who don't have time to start everything from scratch. The support...",
    seeMore: true,
    status: { title: "Approved", badge: "success", icon: "check" },
    time: "Nov 03, 10:43 AM",
  },
];

const StarRating = ({ rating }) => (
  <>
    {[1, 2, 3, 4, 5].map((star) => {
      if (star <= Math.floor(rating)) {
        return <span key={star} className="fa fa-star text-warning" />;
      } else if (star === Math.ceil(rating) && rating % 1 !== 0) {
        return <span key={star} className="fa fa-star-half-alt text-warning" />;
      }
      return (
        <span key={star} className="fa-regular fa-star text-warning-light" />
      );
    })}
  </>
);

const CustomerAvatar = ({ customer }) => {
  if (customer.initials) {
    return (
      <div className="avatar-name rounded-circle">
        <span>{customer.initials}</span>
      </div>
    );
  }
  return (
    <img className="rounded-circle" src={customer.avatar} alt={customer.name} />
  );
};

const LastReviewTable = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filtrage
  const filteredData = reviewsData.filter(
    (review) =>
      review.product.toLowerCase().includes(search.toLowerCase()) ||
      review.customer.name.toLowerCase().includes(search.toLowerCase()),
  );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
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
                placeholder="Search"
                aria-label="Search"
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
          <button
            className="btn btn-sm btn-phoenix-secondary bg-body-emphasis bg-body-hover me-2"
            type="button"
          >
            All products
          </button>
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
              <a className="dropdown-item" href="#!">
                Action
              </a>
            </li>
            <li>
              <a className="dropdown-item" href="#!">
                Another action
              </a>
            </li>
            <li>
              <a className="dropdown-item" href="#!">
                Something else here
              </a>
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
              <th className="align-middle" scope="col" />
              <th
                className="align-middle"
                scope="col"
                style={{ minWidth: 360 }}
              >
                PRODUCT
              </th>
              <th
                className="align-middle"
                scope="col"
                style={{ minWidth: 200 }}
              >
                CUSTOMER
              </th>
              <th
                className="align-middle"
                scope="col"
                style={{ minWidth: 110 }}
              >
                RATING
              </th>
              <th
                className="align-middle"
                scope="col"
                style={{ maxWidth: 350 }}
              >
                REVIEW
              </th>
              <th className="text-start ps-5 align-middle" scope="col">
                STATUS
              </th>
              <th className="text-end align-middle" scope="col">
                TIME
              </th>
              <th className="text-end pe-0 align-middle" scope="col" />
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((review) => (
              <tr
                key={review.id}
                className="hover-actions-trigger btn-reveal-trigger position-static"
              >
                <td className="fs-9 align-middle ps-0">
                  <div className="form-check mb-0 fs-8">
                    <input className="form-check-input" type="checkbox" />
                  </div>
                </td>
                <td className="align-middle white-space-nowrap py-0">
                  <a
                    className="d-block rounded-2 border border-translucent"
                    href="#!"
                  >
                    <img
                      src={review.productImage}
                      alt={review.product}
                      width={53}
                    />
                  </a>
                </td>
                <td className="align-middle white-space-nowrap">
                  <a className="fw-semibold" href="#!">
                    {review.product}
                  </a>
                </td>
                <td className="align-middle white-space-nowrap">
                  <a className="d-flex align-items-center text-body" href="#!">
                    <div className="avatar avatar-l">
                      <CustomerAvatar customer={review.customer} />
                    </div>
                    <h6 className="mb-0 ms-3 text-body">
                      {review.customer.name}
                    </h6>
                  </a>
                </td>
                <td className="align-middle white-space-nowrap fs-10">
                  <StarRating rating={review.rating} />
                </td>
                <td className="align-middle" style={{ minWidth: 350 }}>
                  <p className="fs-9 fw-semibold text-body-highlight mb-0">
                    {review.review}
                  </p>
                </td>
                <td className="align-middle text-start ps-5">
                  <span
                    className={`badge badge-phoenix fs-10 badge-phoenix-${review.status.badge}`}
                  >
                    <span className="badge-label">{review.status.title}</span>
                    <span
                      className={`ms-1 fas fa-${review.status.icon}`}
                      style={{ fontSize: "12.8px" }}
                    />
                  </span>
                </td>
                <td className="align-middle text-end white-space-nowrap">
                  <h6 className="text-body-highlight mb-0">{review.time}</h6>
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
                    <a className="dropdown-item" href="#!">
                      View
                    </a>
                    <a className="dropdown-item" href="#!">
                      Export
                    </a>
                    <div className="dropdown-divider" />
                    <a className="dropdown-item text-danger" href="#!">
                      Remove
                    </a>
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
            {Math.min(currentPage * itemsPerPage, filteredData.length)} of{" "}
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
            Previous
          </button>
          <button
            className="btn btn-link px-1 ms-1"
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
            <span className="fas fa-chevron-right ms-2" />
          </button>
        </div>
      </div>
    </>
  );
};

export default LastReviewTable;
