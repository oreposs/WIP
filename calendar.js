let calendar;

document.addEventListener('DOMContentLoaded', function () {
    if (window.emailjs && typeof emailjs.init === 'function') {
        emailjs.init('LII1vITaF7CtBLeqP');
    }

    // Page navigation
    const frontPage = document.getElementById('front-page');
    const bookingPage = document.getElementById('booking-page');
    const adminPage = document.getElementById('admin-page');
    const backToBookingBtn = document.getElementById('back-to-booking');
    const goToBookingBtn = document.getElementById('go-to-booking');

    // DEBUG: Log elements
    console.log('Front page:', frontPage);
    console.log('Booking page:', bookingPage);
    console.log('Calendar element:', document.getElementById('calendar'));

    // Front page to booking navigation
    goToBookingBtn.addEventListener('click', function (e) {
        e.preventDefault();
        bookingPage.scrollIntoView({ behavior: 'smooth' });

        // Initialize calendar once with delay to ensure visibility
        setTimeout(() => {
            if (!calendar) {
                console.log('Initializing calendar...');
                initializeCalendar();
            }
        }, 100);
    });

    // Initialize calendar immediately on page load
    setTimeout(() => {
        console.log('Auto-initializing calendar on page load...');
        initializeCalendar();
    }, 500);

    // Admin to booking navigation
    backToBookingBtn.addEventListener('click', function () {
        adminPage.style.display = 'none';
        bookingPage.style.display = 'block';
    });

    // Admin button tap detection and login
    const headerTitle = document.getElementById('header-title');
    const adminLink = document.getElementById('admin-link');
    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('login-form');
    const loginCancel = document.getElementById('login-cancel');
    const loginError = document.getElementById('login-error');
    let tapCount = 0;
    let tapTimeout;

    headerTitle.addEventListener('click', function () {
        tapCount++;
        clearTimeout(tapTimeout);
        
        if (tapCount === 5) {
            adminLink.style.display = 'block';
            tapCount = 0;
        }
        
        tapTimeout = setTimeout(() => {
            tapCount = 0;
        }, 1000);
    });

    // Prevent default link navigation and show login modal
    adminLink.addEventListener('click', function (e) {
        e.preventDefault();
        loginModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        loginError.style.display = 'none';
    });

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (username === 'admin' && password === 'admin123') {
            loginError.style.display = 'none';
            loginModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            adminPage.style.display = 'block';
            bookingPage.style.display = 'none';
            loadAdminData();
        } else {
            loginError.textContent = 'Invalid username or password';
            loginError.style.display = 'block';
        }
    });

    loginCancel.addEventListener('click', function () {
        loginModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    });

    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    });

    // ==================== BOOKING PAGE FUNCTIONALITY ====================

    const timeButtonsContainer = document.getElementById('time-buttons');
    const messageEl = document.getElementById('message');
    const modal = document.getElementById('booking-modal');
    const modalForm = document.getElementById('modal-form');
    const modalClose = document.getElementById('modal-close');
    const modalCancel = document.getElementById('modal-cancel');
    const meetingTypeInput = document.getElementById('meeting-type');
    const meetingTypeButtons = document.querySelectorAll('.meeting-type-btn');
    const timeHeaderText = document.getElementById('time-header-text');

    const todayStr = new Date().toISOString().split('T')[0];

    function isPastDate(dateStr) {
        if (!dateStr) return true;
        const today = new Date();
        const todayLocal = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
        return dateStr <= todayLocal; // <= blocks today and earlier
    }

    function getFormattedDateString(dateStr) {
        const date = new Date(dateStr + 'T00:00:00');
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'};
        return date.toLocaleDateString('en-US', options);
    }

    meetingTypeButtons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            meetingTypeButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            meetingTypeInput.value = this.dataset.type;
        });
    });

    timeButtonsContainer.innerHTML = '';
    timeButtonsContainer.style.display = 'none';

    function initializeCalendar() {
        // Prevent multiple initializations
        if (calendar) {
            console.log('Calendar already initialized');
            return;
        }

        // Get the calendar element inside the function
        const calendarEl = document.getElementById('calendar');
        if (!calendarEl) {
            console.error('Calendar element not found!');
            return;
        }

        console.log('Creating calendar instance...');
        
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            initialDate: todayStr,
            selectable: false,
            events: loadReservations(),
            datesSet: function(info) {
                try {
                    // Use calendar.getDate() to get the current visible date
                    const cur = calendar.getDate();
                    const monthSelect = document.getElementById('month-select');
                    const yearInput = document.getElementById('year-input');
                    if (monthSelect) monthSelect.value = String(cur.getMonth());
                    if (yearInput) yearInput.value = String(cur.getFullYear());
                } catch (e) {
                    // ignore if controls not present
                }
            },
            eventDidMount: function (info) {
                info.el.style.backgroundColor = '#FF6B6B';
                info.el.style.borderColor = '#FF6B6B';
                info.el.title = 'Booked: ' + info.event.start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            },
            dayCellDidMount: function (arg) {
                const cellDate = arg.date.getFullYear() + '-' + String(arg.date.getMonth() + 1).padStart(2, '0') + '-' + String(arg.date.getDate()).padStart(2, '0');
                const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
                const dayReservations = reservations.filter(r => r.date === cellDate);
                const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM', '07:00 PM', '08:00 PM'];
                const bookedTimes = dayReservations.map(r => r.time);
                const availableTimes = timeSlots.filter(t => !bookedTimes.includes(t));

                if (isPastDate(cellDate)) {
                    arg.el.classList.add('fc-day-disabled');
                    arg.el.style.opacity = '0.6';
                    arg.el.style.cursor = 'not-allowed';
                    arg.el.style.pointerEvents = 'none';
                } else {
                    arg.el.style.pointerEvents = 'auto';
                    arg.el.style.cursor = 'pointer';

                    if (dayReservations.length > 0 && availableTimes.length > 0) {
                        arg.el.classList.add('partial-day');
                        arg.el.style.backgroundColor = 'rgba(255, 215, 0, 0.08)';
                        arg.el.style.borderLeft = '4px solid #FFD700';
                    } else if (dayReservations.length > 0 && availableTimes.length === 0) {
                        arg.el.classList.add('booked-day');
                        arg.el.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
                        arg.el.style.borderLeft = '4px solid #FF6B6B';
                    } else {
                        arg.el.classList.add('available-day');
                        arg.el.style.backgroundColor = 'rgba(124, 252, 0, 0.06)';
                        arg.el.style.borderLeft = '4px solid #7CFC00';
                    }

                    arg.el.addEventListener('click', function (e) {
                        e.stopPropagation();
                        const clickedDate = cellDate;
                        // load available times for the CLICKED date (not next day)
                        loadAvailableTimeSlots(clickedDate);
                        timeButtonsContainer.style.display = 'flex';

                        const formattedDate = getFormattedDateString(clickedDate);
                        timeHeaderText.textContent = `Available Times for ${formattedDate}`;
                    });
                }
            }
        });

        calendar.render();
        console.log('Calendar rendered successfully!');

        // Initialize controls with current month/year
        const yearInput = document.getElementById('year-input');
        const monthSelect = document.getElementById('month-select');
        const gotoMonthBtn = document.getElementById('goto-month-btn');
        
        if (yearInput && !yearInput.value) {
            yearInput.value = new Date().getFullYear();
        }

        // Wire the Go button to jump to the chosen month/year
        if (gotoMonthBtn) {
            gotoMonthBtn.addEventListener('click', function (e) {
                e.preventDefault();
                const y = parseInt(yearInput && yearInput.value ? yearInput.value : new Date().getFullYear(), 10);
                const m = parseInt(monthSelect && monthSelect.value ? monthSelect.value : new Date().getMonth(), 10);
                if (!isNaN(y) && !isNaN(m) && calendar) {
                    const target = new Date(y, m, 1);
                    calendar.gotoDate(target);
                }
            });

            // allow Enter to trigger go
            if (yearInput) {
                yearInput.addEventListener('keydown', function (ev) {
                    if (ev.key === 'Enter') {
                        ev.preventDefault();
                        gotoMonthBtn.click();
                    }
                });
            }
        }
    }

    function renderTimeButtons(allTimes, date, bookedTimes) {
        timeButtonsContainer.innerHTML = '';
        if (!allTimes || !allTimes.length) {
            const p = document.createElement('p');
            p.textContent = 'No available times';
            p.style.color = '#bbb';
            timeButtonsContainer.appendChild(p);
            return;
        }

        allTimes.forEach(t => {
            const isBooked = Array.isArray(bookedTimes) && bookedTimes.includes(t);
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'time-btn ' + (isBooked ? 'booked' : 'available');
            btn.textContent = t + (isBooked ? ' — Booked' : '');
            btn.dataset.time = t;

            if (isBooked) {
                btn.disabled = true;
                btn.title = 'This time is already booked';
            } else {
                btn.addEventListener('click', () => openModal(date, t));
                btn.title = 'Click to book ' + t;
            }

            timeButtonsContainer.appendChild(btn);
        });
    }

    function checkFormCompletion() {
        const selectedDate = modal.dataset.date;
        const selectedTime = modal.dataset.time;
        const meetingType = meetingTypeInput.value;
        const packageSelected = document.getElementById('package').value;
        const firstName = document.getElementById('first-name').value.trim();
        const lastName = document.getElementById('last-name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();

        const missingFields = [];
        if (!selectedDate || !selectedTime) missingFields.push('Date & Time');
        if (!meetingType) missingFields.push('Meeting Type');
        if (!packageSelected) missingFields.push('Package');
        if (!firstName) missingFields.push('First Name');
        if (!lastName) missingFields.push('Last Name');
        if (!email) missingFields.push('Email');
        if (!phone) missingFields.push('Phone');

        const submitBtn = document.getElementById('modal-submit');
        const completionBar = document.getElementById('completion-status');

        if (missingFields.length === 0) {
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
            submitBtn.disabled = false;
            if (completionBar) {
                completionBar.textContent = '✓ All fields complete';
                completionBar.className = 'completion-status success';
            }
        } else {
            submitBtn.style.opacity = '0.6';
            submitBtn.style.cursor = 'not-allowed';
            submitBtn.disabled = true;
            if (completionBar) {
                completionBar.textContent = '⚠️ Incomplete: ' + missingFields.join(', ');
                completionBar.className = 'completion-status warning';
            }
        }
    }

    function openModal(date, time) {
        modal.setAttribute('aria-hidden', 'false');
        modal.dataset.date = date;
        modal.dataset.time = time;
        document.body.style.overflow = 'hidden';
        meetingTypeButtons.forEach(b => b.classList.remove('active'));
        meetingTypeInput.value = '';
        const el = document.getElementById('package');
        if (el) el.focus();
        const mc = modal.querySelector('.modal-content');
        if (mc) mc.scrollTop = 0;
        setTimeout(checkFormCompletion, 100); // Check after modal opens
    }

    function closeModal() {
        modal.setAttribute('aria-hidden', 'true');
        modalForm.reset();
        meetingTypeButtons.forEach(b => b.classList.remove('active'));
        meetingTypeInput.value = '';
        document.body.style.overflow = '';
    }

    modalClose.addEventListener('click', closeModal);
    modalCancel.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    function sendEmail(params) {
        if (!window.emailjs || typeof emailjs.send !== 'function') {
            return Promise.reject(new Error('EmailJS not available'));
        }
        return emailjs.send('service_p29iiby', 'template_or4y46t', params);
    }

    modalForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const selectedDate = modal.dataset.date;
        const selectedTime = modal.dataset.time;
        const meetingType = meetingTypeInput.value;
        const packageSelected = document.getElementById('package').value;
        const firstName = document.getElementById('first-name').value.trim();
        const lastName = document.getElementById('last-name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const notes = document.getElementById('notes').value.trim();

        // Collect validation errors
        const errors = [];

        if (!selectedDate || !selectedTime) {
            errors.push('Date & Time');
        }
        if (!meetingType) {
            errors.push('Meeting Type');
        }
        if (!packageSelected) {
            errors.push('Package Selection');
        }
        if (!firstName) {
            errors.push('First Name');
        }
        if (!lastName) {
            errors.push('Last Name');
        }
        if (!email) {
            errors.push('Email');
        }
        if (!phone) {
            errors.push('Phone Number');
        }

        // Display detailed error message if any fields are missing
        if (errors.length > 0) {
            messageEl.textContent = '⚠️ Please complete: ' + errors.join(', ');
            messageEl.className = 'error';
            return;
        }
        if (isPastDate(selectedDate)) {
            messageEl.textContent = 'Cannot book past dates.';
            messageEl.className = 'error';
            closeModal();
            return;
        }

        const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
        if (reservations.some(r => r.date === selectedDate && r.time === selectedTime)) {
            messageEl.textContent = 'This time slot is already booked.';
            messageEl.className = 'error';
            closeModal();
            return;
        }

        const reservation = {
            date: selectedDate,
            time: selectedTime,
            meetingType: meetingType,
            package: packageSelected,
            firstName,
            lastName,
            email,
            phone,
            notes,
            status: 'pending'
        };

        reservations.push(reservation);
        localStorage.setItem('reservations', JSON.stringify(reservations));

        calendar.addEvent({
            title: 'Booked',
            start: reservation.date + 'T' + reservation.time,
            allDay: false,
            backgroundColor: '#FF6B6B',
            borderColor: '#FF6B6B'
        });

        calendar.refetchEvents();

        const templateParams = {
            firstname: firstName,
            lastname: lastName,
            email: email,
            phone: phone,
            order_date: selectedDate,
            order_time: selectedTime,
            meeting_type: meetingType === 'in-person' ? 'In-Person Consultation' : 'Zoom Meeting',
            package: packageSelected,
            additional_notes: notes,
            date: new Date().toLocaleDateString()
        };

        sendEmail(templateParams)
            .then(() => {
                messageEl.textContent = 'Reservation submitted! Confirmation email sent.';
                messageEl.className = 'success';
                closeModal();
                loadAvailableTimeSlots(selectedDate);

                setTimeout(() => {
                    location.reload();
                }, 2000);
            })
            .catch((err) => {
                messageEl.textContent = 'Reservation saved but email failed. Check console.';
                messageEl.className = 'error';
                console.error('EmailJS Error:', err);
                closeModal();
            });
    });

    window.loadAvailableTimeSlots = function (date) {
        const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM', '07:00 PM', '08:00 PM'];
        const reservations = JSON.parse(localStorage.getItem('reservations')) || [];

        if (!date) {
            renderTimeButtons([], date, []); // render empty if no date
            return;
        }
        if (isPastDate(date)) {
            renderTimeButtons([], date, []); // render empty if past date
            return;
        }

        const bookedTimes = reservations.filter(r => r.date === date).map(r => r.time);
        renderTimeButtons(timeSlots, date, bookedTimes);
    };

    // Add real-time validation to form fields
    const formFields = [
        document.getElementById('package'),
        document.getElementById('first-name'),
        document.getElementById('last-name'),
        document.getElementById('email'),
        document.getElementById('phone')
    ];

    formFields.forEach(field => {
        if (field) {
            field.addEventListener('change', checkFormCompletion);
            field.addEventListener('input', checkFormCompletion);
        }
    });

// ==================== ADMIN PAGE FUNCTIONALITY ====================

    const bookingsTbody = document.getElementById('bookings-tbody');
    const bookingsTable = document.getElementById('bookings-table');
    const noBookingsMsg = document.getElementById('no-bookings-msg');
    const showingCount = document.getElementById('showing-count');
    const totalBookingsEl = document.getElementById('total-bookings');
    const inPersonCountEl = document.getElementById('in-person-count');
    const zoomCountEl = document.getElementById('zoom-count');
    
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const sortSelect = document.getElementById('sort-select');
    const dateRangeFilter = document.getElementById('date-range-filter');
    const packageFilter = document.getElementById('package-filter');
    const meetingFilter = document.getElementById('meeting-filter');
    const statusFilter = document.getElementById('status-filter');
    const resetFiltersBtn = document.getElementById('reset-filters');
    const exportBtn = document.getElementById('export-btn');
    
    const detailsModal = document.getElementById('details-modal');
    const detailsClose = document.getElementById('details-close');
    const detailsCloseBtn = document.getElementById('details-close-btn');
    const detailsContent = document.getElementById('details-content');

    let allBookings = [];
    let filteredBookings = [];

    function convertTo24Hour(time12hr) {
        const [time, period] = time12hr.split(' ');
        let [hours, minutes] = time.split(':');
        hours = parseInt(hours);
        
        if (period === 'PM' && hours !== 12) {
            hours += 12;
        } else if (period === 'AM' && hours === 12) {
            hours = 0;
        }
        
        return `${String(hours).padStart(2, '0')}:${minutes}`;
    }

    function isPastBookingTime(date, time) {
        const today = new Date();
        const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
        
        if (date < todayStr) {
            return true;
        }
        
        if (date === todayStr) {
            const currentTime = String(today.getHours()).padStart(2, '0') + ':' + String(today.getMinutes()).padStart(2, '0');
            const bookingTime24hr = convertTo24Hour(time);
            return currentTime > bookingTime24hr;
        }
        
        return false;
    }

    function loadAdminData() {
        allBookings = JSON.parse(localStorage.getItem('reservations')) || [];
        
        let bookingsUpdated = false;
        allBookings.forEach(booking => {
            if ((booking.status === 'pending' || !booking.status) && isPastBookingTime(booking.date, booking.time)) {
                booking.status = 'missed';
                bookingsUpdated = true;
            }
        });
        
        if (bookingsUpdated) {
            localStorage.setItem('reservations', JSON.stringify(allBookings));
        }
        
        updateStats();
        filterAndDisplayBookings();
    }

    function updateStats() {
        totalBookingsEl.textContent = allBookings.length;
        const inPersonCount = allBookings.filter(b => b.meetingType === 'in-person').length;
        const zoomCount = allBookings.filter(b => b.meetingType === 'zoom').length;
        inPersonCountEl.textContent = inPersonCount;
        zoomCountEl.textContent = zoomCount;
    }

    function filterAndDisplayBookings() {
        const searchTerm = searchInput.value.toLowerCase();
        const packageFilterValue = packageFilter.value;
        const meetingFilterValue = meetingFilter.value;
        const statusFilterValue = statusFilter.value;
        const dateRangeValue = dateRangeFilter.value;
        const sortValue = sortSelect.value;

        // Calculate date range for filtering
        let startDate = null;
        if (dateRangeValue) {
            const today = new Date();
            if (dateRangeValue === '1-week') {
                startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            } else if (dateRangeValue === '1-month') {
                startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            } else if (dateRangeValue === '1-year') {
                startDate = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
            }
        }

        filteredBookings = allBookings.filter(booking => {
            const matchesSearch = !searchTerm || 
                booking.firstName.toLowerCase().includes(searchTerm) ||
                booking.lastName.toLowerCase().includes(searchTerm) ||
                booking.email.toLowerCase().includes(searchTerm) ||
                booking.phone.includes(searchTerm);

            const matchesPackage = !packageFilterValue || booking.package === packageFilterValue;
            const matchesMeeting = !meetingFilterValue || booking.meetingType === meetingFilterValue;
            const matchesStatus = !statusFilterValue || (booking.status || 'pending') === statusFilterValue;
            
            // Check date range
            let matchesDateRange = true;
            if (startDate) {
                const bookingDate = new Date(booking.date);
                matchesDateRange = bookingDate >= startDate;
            }

            return matchesSearch && matchesPackage && matchesMeeting && matchesStatus && matchesDateRange;
        });

        filteredBookings.sort((a, b) => {
            switch (sortValue) {
                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);
                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);
                case 'name':
                    return (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName);
                default:
                    return 0;
            }
        });

        displayBookings();
    }

    function displayBookings() {
        bookingsTbody.innerHTML = '';

        if (filteredBookings.length === 0) {
            bookingsTable.style.display = 'none';
            noBookingsMsg.style.display = 'block';
            showingCount.textContent = 'Showing 0 bookings';
            return;
        }

        bookingsTable.style.display = 'table';
        noBookingsMsg.style.display = 'none';
        showingCount.textContent = `Showing ${filteredBookings.length} booking${filteredBookings.length !== 1 ? 's' : ''}`;

        filteredBookings.forEach((booking, index) => {
            const row = document.createElement('tr');
            const actualIndex = allBookings.indexOf(booking);

            const meetingTypeDisplay = booking.meetingType === 'in-person' ? 'In-Person' : 'Zoom';
            const statusDisplay = booking.status || 'pending';
            let statusBadgeClass = 'status-pending';
            let statusText = '⏳ Pending';
            let isClickable = true;
            
            if (statusDisplay === 'done') {
                statusBadgeClass = 'status-done';
                statusText = '✓ Done';
            } else if (statusDisplay === 'missed') {
                statusBadgeClass = 'status-missed';
                statusText = '✗ Missed';
                isClickable = false;
            }
            
            const notePreview = booking.notes ? booking.notes.substring(0, 30) + (booking.notes.length > 30 ? '...' : '') : '—';
            const clickableAttr = isClickable ? 'data-index="' + actualIndex + '"' : 'disabled';
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${booking.firstName} ${booking.lastName}</td>
                <td>${booking.email}</td>
                <td>${booking.phone}</td>
                <td>${new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                <td>${booking.time}</td>
                <td><span class="package-badge package-${booking.package.toLowerCase()}">${booking.package}</span></td>
                <td><span class="meeting-badge meeting-${booking.meetingType}">${meetingTypeDisplay}</span></td>
                <td class="status-cell"><span class="status-badge ${statusBadgeClass} ${!isClickable ? 'status-locked' : ''}" ${clickableAttr} style="cursor: ${isClickable ? 'pointer' : 'not-allowed'}; font-weight: 700;" title="${!isClickable ? 'Missed bookings cannot be changed' : 'Click to change status'}">${statusText}</span></td>
                <td class="notes-cell">${notePreview}</td>
                <td class="actions-cell"><button class="btn-view" data-index="${actualIndex}" title="View details">👁️</button></td>
                <td class="actions-cell"><button class="btn-delete" data-index="${actualIndex}" title="Delete booking">🗑️</button></td>
            `;
            bookingsTbody.appendChild(row);
        });

        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', () => showDetailsModal(parseInt(btn.dataset.index)));
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => deleteBooking(parseInt(btn.dataset.index)));
        });

        document.querySelectorAll('.status-badge:not(.status-locked)').forEach(badge => {
            badge.addEventListener('click', () => {
                const index = parseInt(badge.dataset.index);
                cycleBookingStatus(index);
            });
        });
    }

    function showDetailsModal(index) {
        const booking = allBookings[index];
        if (!booking) return;

        const meetingTypeDisplay = booking.meetingType === 'in-person' ? 'In-Person Consultation' : 'Zoom Meeting';
        const dateFormatted = new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        const statusDisplay = booking.status || 'pending';
        
        let statusBadgeClass = 'status-pending';
        let statusText = '⏳ Pending';
        let isMissed = false;
        
        if (statusDisplay === 'done') {
            statusBadgeClass = 'status-done';
            statusText = '✓ Done';
        } else if (statusDisplay === 'missed') {
            statusBadgeClass = 'status-missed';
            statusText = '✗ Missed';
            isMissed = true;
        }

        detailsContent.innerHTML = `
            <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${booking.firstName} ${booking.lastName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value"><a href="mailto:${booking.email}">${booking.email}</a></span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span class="detail-value"><a href="tel:${booking.phone}">${booking.phone}</a></span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${dateFormatted}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${booking.time}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Package:</span>
                <span class="detail-value">${booking.package}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Meeting Type:</span>
                <span class="detail-value">${meetingTypeDisplay}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value"><span class="status-badge ${statusBadgeClass} ${isMissed ? 'status-locked' : ''}" id="detail-status-badge" data-index="${index}" style="cursor: ${isMissed ? 'not-allowed' : 'pointer'}; font-weight: 700;" title="${isMissed ? 'Missed bookings cannot be changed' : 'Click to change status'}">${statusText}</span></span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Notes:</span>
                <span class="detail-value">${booking.notes || '—'}</span>
            </div>
        `;

        const detailStatusBadge = document.getElementById('detail-status-badge');
        if (detailStatusBadge && !isMissed) {
            detailStatusBadge.addEventListener('click', () => {
                cycleBookingStatus(index);
                closeDetailsModal();
                filterAndDisplayBookings();
            });
        }

        detailsModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeDetailsModal() {
        detailsModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function exportToCSV() {
        if (filteredBookings.length === 0) {
            alert('No bookings to export');
            return;
        }

        let csv = 'First Name,Last Name,Email,Phone,Date,Time,Package,Meeting Type,Notes\n';

        filteredBookings.forEach(booking => {
            const date = new Date(booking.date).toLocaleDateString('en-US');
            const notes = booking.notes ? '"' + booking.notes.replace(/"/g, '""') + '"' : '';
            csv += `${booking.firstName},${booking.lastName},${booking.email},${booking.phone},${date},${booking.time},${booking.package},${booking.meetingType},${notes}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `bookings_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function cycleBookingStatus(index) {
        if (index < 0 || index >= allBookings.length) return;

        const booking = allBookings[index];
        const currentStatus = booking.status || 'pending';
        
        let newStatus;
        if (currentStatus === 'pending') {
            newStatus = 'done';
        } else if (currentStatus === 'done') {
            newStatus = 'missed';
        } else {
            newStatus = 'pending';
        }
        
        booking.status = newStatus;
        localStorage.setItem('reservations', JSON.stringify(allBookings));
        filterAndDisplayBookings();
    }

    function deleteBooking(index) {
        if (index < 0 || index >= allBookings.length) return;

        const booking = allBookings[index];
        const confirmDelete = confirm(`Are you sure you want to delete the booking for ${booking.firstName} ${booking.lastName} on ${booking.date} at ${booking.time}?`);
        
        if (confirmDelete) {
            allBookings.splice(index, 1);
            localStorage.setItem('reservations', JSON.stringify(allBookings));
            updateStats();
            filterAndDisplayBookings();
        }
    }

    searchBtn.addEventListener('click', filterAndDisplayBookings);
    searchInput.addEventListener('keyup', function (e) {
        if (e.key === 'Enter') filterAndDisplayBookings();
    });
    sortSelect.addEventListener('change', filterAndDisplayBookings);
    dateRangeFilter.addEventListener('change', filterAndDisplayBookings);
    packageFilter.addEventListener('change', filterAndDisplayBookings);
    meetingFilter.addEventListener('change', filterAndDisplayBookings);
    statusFilter.addEventListener('change', filterAndDisplayBookings);
    resetFiltersBtn.addEventListener('click', function () {
        searchInput.value = '';
        sortSelect.value = 'date-asc';
        dateRangeFilter.value = '';
        packageFilter.value = '';
        meetingFilter.value = '';
        statusFilter.value = '';
        filterAndDisplayBookings();
    });
    exportBtn.addEventListener('click', exportToCSV);

    detailsClose.addEventListener('click', closeDetailsModal);
    detailsCloseBtn.addEventListener('click', closeDetailsModal);

    detailsModal.addEventListener('click', (e) => {
        if (e.target === detailsModal) closeDetailsModal();
    });
});

function loadReservations() {
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    return reservations.map(res => ({
        title: 'Booked',
        start: res.date + 'T' + res.time,
        allDay: false,
        backgroundColor: '#FF6B6B',
        borderColor: '#FF6B6B'
    }));
}