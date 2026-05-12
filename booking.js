// ============================================================
// GEAR LAGOS — booking.js  (full rewrite)
// ============================================================

// ── Rate & image maps ────────────────────────────────────────

const rateMap = {
    'Toyota Camry':          20000,
    'Lexus RX 350H':         75000,
    'Honda Accord':          18000,
    'BMW X5M Competition':  150000,
    'Bajaj Boxer':           20000,
    'Volkswagen Carrier':    45000,
    'Keke':                  18000,
    'Suzuki Every':          30000,
    'Hyundai Sonata':        18000,
    'Lexus ES 350':          35000,
    'Mercedes-AMG GLE 53':  120000,
    'Lamborghini Urus':     250000,
    'Audi RSQ8':            160000,
    'Porsche Cayenne Turbo':180000
};

const imageMap = {
    'Toyota Camry':          'images/kencamface.jpg',
    'Lexus RX 350H':         'images/last350front.jpg',
    'Honda Accord':          'images/lastaccord.jpg',
    'BMW X5M Competition':   'images/lastbmwfront.jpg',
    'Bajaj Boxer':           'images/boxer.jpg',
    'Volkswagen Carrier':    'images/danfo.jpg',
    'Keke':                  'images/keks.jpg',
    'Suzuki Every':          'images/koropes.jpg',
    'Hyundai Sonata':        'images/sonata.jpg',
    'Lexus ES 350':          'images/esfront.jpg',
    'Mercedes-AMG GLE 53':   'images/gleface.jpg',
    'Lamborghini Urus':      'images/urus.jpg',
    'Audi RSQ8':             'images/rsq8.jpg',
    'Porsche Cayenne Turbo': 'images/cayenne.jpg'
};

// ── Helpers ──────────────────────────────────────────────────

function formatNaira(amount) {
    return '\u20A6' + Number(amount).toLocaleString();
}

function generateReference() {
    return 'BK-2026-' + Math.floor(10000 + Math.random() * 90000);
}

function getEl(id) {
    return document.getElementById(id);
}

function setVal(id, value) {
    var el = getEl(id);
    if (el) el.value = value;
}

function setText(id, value) {
    var el = getEl(id);
    if (el) el.textContent = value;
}

// ── BOOK.HTML ────────────────────────────────────────────────

function initBookingForm() {
    var proceedBtn = getEl('proceedBtn');
    if (!proceedBtn) return;

    proceedBtn.addEventListener('click', function () {
        var form = getEl('bookingForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        var bookingData = {
            car_selection:   getEl('car_selection').value,
            pickup_location: getEl('pickup_location').value,
            pickup_date:     getEl('pickup_date').value,
            pickup_time:     getEl('pickup_time').value,
            return_date:     getEl('return_date').value,
            return_time:     getEl('return_time').value,
            estimated_hours: getEl('estimated_hours').value,
            fullname:        getEl('fullname').value,
            email:           getEl('email').value,
            phone:           getEl('phone').value,
            nin:             getEl('nin').value,
            drivers_license: getEl('drivers_license').value,
            license_expiry:  getEl('license_expiry').value,
            address:         getEl('address').value
        };

        localStorage.setItem('gearlagos_booking', JSON.stringify(bookingData));
        saveProfileIfChecked(bookingData);
        window.location.href = 'checkout.html';
    });
}

// ── CHECKOUT.HTML ────────────────────────────────────────────

function calculateTotal(vehicleName, hours, chauffeur) {
    var rate         = rateMap[vehicleName] || 0;
    var subtotal     = rate * hours;
    var chauffeurFee = chauffeur === 'yes' ? 20000 : 0;
    return { rate: rate, subtotal: subtotal, chauffeurFee: chauffeurFee, total: subtotal + chauffeurFee };
}

function updateTotal(vehicleName, hours) {
    var chauffeurEl = getEl('chauffeur');
    if (!chauffeurEl) return;

    var chauffeur = chauffeurEl.value;
    var result    = calculateTotal(vehicleName, hours, chauffeur);

    setVal('sum_base_rate',     result.rate   ? formatNaira(result.rate) + '/hr' : 'To be calculated');
    setVal('sum_duration_cost', result.rate && hours ? hours + ' hr(s) \u00d7 ' + formatNaira(result.rate) : 'To be calculated');
    setVal('sum_chauffeur_fee', result.chauffeurFee > 0 ? formatNaira(result.chauffeurFee) : '\u20A60 (not selected)');
    setVal('sum_total',         result.total  ? formatNaira(result.total) : 'To be calculated');
}

function initCheckout() {
    var raw = localStorage.getItem('gearlagos_booking');
    if (!raw) {
        alert('No booking data found. Please fill in the booking form first.');
        window.location.href = 'book.html';
        return;
    }

    var data        = JSON.parse(raw);
    var vehicleName = (data.car_selection || '').split(' (')[0];

    // Car image
    var carImg = getEl('checkout_car_img');
    if (carImg && imageMap[vehicleName]) {
        carImg.src = imageMap[vehicleName];
        carImg.alt = vehicleName;
    }

    // Trip summary
    setVal('sum_vehicle',          data.car_selection    || '');
    setVal('sum_pickup_location',  data.pickup_location  || '');
    setVal('sum_pickup_date',      data.pickup_date      || '');
    setVal('sum_pickup_time',      data.pickup_time      || '');
    setVal('sum_return_date',      data.return_date      || '');
    setVal('sum_return_time',      data.return_time      || '');
    setVal('sum_estimated_hours',  data.estimated_hours  ? data.estimated_hours + ' hr(s)' : '');

    // Customer details
    setVal('sum_fullname', data.fullname        || '');
    setVal('sum_email',    data.email           || '');
    setVal('sum_phone',    data.phone           || '');
    setVal('sum_license',  data.drivers_license || '');

    var hours = parseFloat(data.estimated_hours) || 0;
    updateTotal(vehicleName, hours);

    var chauffeurEl = getEl('chauffeur');
    if (chauffeurEl) {
        chauffeurEl.addEventListener('change', function () {
            updateTotal(vehicleName, hours);
        });
    }
}

// ── SUCCESS.HTML ─────────────────────────────────────────────

function initSuccess() {
    var raw = localStorage.getItem('gearlagos_booking');
    if (!raw) {
        var card = getEl('bookingCard');
        if (card) card.innerHTML = '<div class="no-booking"><h3>No booking found</h3><p>Please complete a booking first.</p></div>';
        return;
    }

    var data        = JSON.parse(raw);
    var vehicleName = (data.car_selection || '').split(' (')[0];
    var rate        = rateMap[vehicleName] || 0;
    var hours       = parseFloat(data.estimated_hours) || 0;
    var total       = rate * hours;

    // Car image
    var imgContainer = getEl('carImgContainer');
    if (imgContainer && imageMap[vehicleName]) {
        imgContainer.innerHTML = '<img src="' + imageMap[vehicleName] + '" alt="' + vehicleName + '" class="booking-car-img">';
    }

    // Booking reference
    setText('bookingRef', generateReference());

    // Dates
    setText('rentalPeriod',   (data.pickup_date || '\u2014') + '  \u2192  ' + (data.return_date || '\u2014'));
    setText('pickupLocation', data.pickup_location || '\u2014');
    setText('duration',       hours ? hours + ' hour(s)' : '\u2014');
    setText('bookedBy',       data.fullname || '\u2014');
    setText('carName',        vehicleName   || '\u2014');
    setText('carMeta',        data.car_selection ? data.car_selection.replace(vehicleName + ' ', '') : '\u2014');
    setText('totalPrice',     total ? '\u20A6' + total.toLocaleString() : 'To be confirmed');

    // Booked-on date
    var today     = new Date();
    var formatted = today.getFullYear() + '-' +
        String(today.getMonth() + 1).padStart(2, '0') + '-' +
        String(today.getDate()).padStart(2, '0');
    setText('bookedOn', 'Booked on ' + formatted);
}

// ── PAYMENT MODAL ────────────────────────────────────────────

function openPaymentModal() {
    var overlay = getEl('paymentModalOverlay');
    if (!overlay) return;
    overlay.classList.add('active');

    // Always reset: show form, hide spinner
    var formBox       = getEl('paymentFormBox');
    var processingBox = getEl('paymentProcessingBox');
    if (formBox)       formBox.style.display       = 'block';
    if (processingBox) processingBox.style.display = 'none';
}

function closePaymentModal() {
    var overlay = getEl('paymentModalOverlay');
    if (overlay) overlay.classList.remove('active');
}

function processPayment() {
    // Validate all card inputs
    var inputs = document.querySelectorAll('.payment-input');
    for (var i = 0; i < inputs.length; i++) {
        if (!inputs[i].value.trim()) {
            alert('Please fill in all card details.');
            return;
        }
    }

    // Switch to spinner
    var formBox       = getEl('paymentFormBox');
    var processingBox = getEl('paymentProcessingBox');
    if (formBox)       formBox.style.display       = 'none';
    if (processingBox) processingBox.style.display = 'flex';

    // Simulate 3-second processing, then go to success page
    setTimeout(function () {
        closePaymentModal();
        window.location.href = 'success.html';
    }, 3000);
}

// ── LOGIN ────────────────────────────────────────────────────

function openLoginModal() {
    var overlay = getEl('loginModalOverlay');
    if (overlay) overlay.classList.add('active');
    var err = getEl('loginError');
    if (err) err.style.display = 'none';
}

function closeLoginModal() {
    var overlay = getEl('loginModalOverlay');
    if (overlay) overlay.classList.remove('active');
}

function handleLogin() {
    var name  = (getEl('login_name').value  || '').trim().toLowerCase();
    var email = (getEl('login_email').value || '').trim().toLowerCase();
    var saved = localStorage.getItem('gearlagos_profile');

    if (!saved) {
        var err = getEl('loginError');
        if (err) err.style.display = 'block';
        return;
    }

    var profile = JSON.parse(saved);

    if (profile.fullname.toLowerCase() === name && profile.email.toLowerCase() === email) {
        localStorage.setItem('gearlagos_session', JSON.stringify(profile));
        closeLoginModal();
        updateLoginBar(profile.fullname);
        if (getEl('bookingForm')) autofillFromProfile(profile);
    } else {
        var err = getEl('loginError');
        if (err) err.style.display = 'block';
    }
}

function updateLoginBar(name) {
    var bar = getEl('loginBarContent');
    if (bar) {
        bar.innerHTML =
            '<span class="welcome-text">Welcome back, ' + name.split(' ')[0] + '!</span>' +
            ' &nbsp;|&nbsp; <a style="cursor:pointer;" onclick="handleLogout()">Sign Out</a>';
    }
}

function handleLogout() {
    localStorage.removeItem('gearlagos_session');
    var bar = getEl('loginBarContent');
    if (bar) {
        bar.innerHTML = 'Returning customer? <a style="cursor:pointer;" onclick="openLoginModal()">Sign In</a>';
    }
}

function autofillFromProfile(profile) {
    var fields = ['fullname', 'email', 'phone', 'nin', 'drivers_license', 'license_expiry', 'address'];
    fields.forEach(function (field) {
        var el = getEl(field);
        if (el && profile[field]) el.value = profile[field];
    });
}

function saveProfileIfChecked(data) {
    var saveCheckbox = getEl('save_profile');
    if (saveCheckbox && saveCheckbox.checked) {
        var profile = {
            fullname:        data.fullname,
            email:           data.email,
            phone:           data.phone,
            nin:             data.nin,
            drivers_license: data.drivers_license,
            license_expiry:  data.license_expiry,
            address:         data.address
        };
        localStorage.setItem('gearlagos_profile', JSON.stringify(profile));
    }
}

function initLoginBar() {
    var session = localStorage.getItem('gearlagos_session');
    if (session) {
        var profile = JSON.parse(session);
        updateLoginBar(profile.fullname);
        if (getEl('bookingForm')) autofillFromProfile(profile);
    }
}

// ── IMAGE GALLERY ────────────────────────────────────────────

function swapImage(thumbnailElement, newImageSrc) {
    var mainImg = getEl('mainCarImage');
    if (mainImg) mainImg.src = newImageSrc;

    var thumbnails = document.getElementsByClassName('car-thumbnail');
    for (var i = 0; i < thumbnails.length; i++) {
        thumbnails[i].style.borderColor = 'transparent';
    }
    thumbnailElement.style.borderColor = '#d90429';
}

// ── GLOBAL CLICK — close modals on backdrop click ────────────

document.addEventListener('click', function (e) {
    var loginOverlay   = getEl('loginModalOverlay');
    var paymentOverlay = getEl('paymentModalOverlay');

    if (loginOverlay   && e.target === loginOverlay)   closeLoginModal();
    if (paymentOverlay && e.target === paymentOverlay) closePaymentModal();
});

// ── BOOT ─────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    initLoginBar();

    if (getEl('bookingForm'))  initBookingForm();
    if (getEl('checkoutForm')) initCheckout();
    if (getEl('bookingCard'))  initSuccess();
    // Add this inside the document.addEventListener('DOMContentLoaded', function () { ... });

    const heroSlider = getEl('heroAutoSlider');
    if (heroSlider) {
        let currentSlide = 0;
        const totalSlides = 7;

        setInterval(() => {
            currentSlide++;
            if (currentSlide >= totalSlides) {
                currentSlide = 0;
            }
            // Move the slider by 100% for each index
            heroSlider.style.transform = `translateX(-${currentSlide * 100}%)`;
        }, 6000); // 6 Seconds
    }
});