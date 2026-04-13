const navbar = 
`
<!-- navbar -->
    <nav class="navbar navbar-expand-lg">
        <div class="container-fluid">
            <a href="/index.html" class="navbar-brand">
                <img id="navbar-logo-img" src="/images/homeplate-logo-transparent.png" alt="">
                <h1 id="navbar-header-text">HomePlate</h1>
            </a>

            <a class="nav-item nav-link m-2" id="logout-nav-button" href="/admin-dashboard.html">
                Dashboard Demo
            </a>
        </div>
    </nav>
`;

const sidenav = 
`
 <!-- sidebar -->
        <div class="sidebar-container">
            <nav class="sidebar-nav">
                <!-- sidebar links + tooltips -->
                <a href="/admin-dashboard.html">
                    <img class="sidebar-nav-link-icon" data-bs-toggle="tooltip" data-bs-placement="right" title="Dashboard Home" src="/images/home-icon.png" alt="">
                </a>
                <a href="/vendor-applications.html">
                    <img class="sidebar-nav-link-icon" data-bs-toggle="tooltip" data-bs-placement="right" title="Vendor Applications" src="/images/applications-icon.png" alt="">
                    <span class="badge rounded-pill bg-danger">
                        <span class="visually-hidden">New alerts</span>
                    </span>
                </a>
                <a href="/revenue.html">
                    <img class="sidebar-nav-link-icon" data-bs-toggle="tooltip" data-bs-placement="right" title="Revenue" src="/images/revenue-icon.png" alt="">
                </a>
                <a href="/manage-user.html">
                    <img class="sidebar-nav-link-icon" data-bs-toggle="tooltip" data-bs-placement="right" title="User Management" src="/images/users-icon.png" alt="">
                </a>
                <a href="/moderate-content.html">
                    <img class="sidebar-nav-link-icon" data-bs-toggle="tooltip" data-bs-placement="right" title="Issues" src="/images/exclaim-icon.png" alt="">
                </a>
                <a href="/disputes.html">
                    <img class="sidebar-nav-link-icon" data-bs-toggle="tooltip" data-bs-placement="right" title="Disputes" src="/images/handshake-icon.png" alt="">
                    <span class="badge rounded-pill bg-danger">
                        <span class="visually-hidden">New alerts</span>
                    </span>
                </a>
                <a href="/admin-profile.html">
                    <img class="sidebar-nav-link-icon" data-bs-toggle="tooltip" data-bs-placement="right" title="My Account" src="/images/default-user.png" alt="">
                </a>
            </nav>
        </div>
`;


// I prompted an AI to help me write a function to be able to keep all the common elements consistent
// maybe we can use a templating engine down the road but this is the all-frontend solution for now

// NOTE: This is dependent that you use the main-box class to encase all your content in!! Otherwise it won't work!
document.addEventListener("DOMContentLoaded", function () {
    document.body.insertAdjacentHTML("afterbegin", navbar);
    const mainBox = document.querySelector(".main-box");
    if (mainBox) {
        mainBox.insertAdjacentHTML("afterbegin", sidenav);
    }

    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (el) {
        return new bootstrap.Tooltip(el);
    });
})