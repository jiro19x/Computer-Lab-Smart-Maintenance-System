import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  serverTimestamp,
  addDoc,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "../../backend/firebase-config.js";
let currentStatusFilter = "All";
let currentStartDate = null;
let currentEndDate = null;

function setupRealtimeListener() {
  const reportListEl = document.querySelector('.report-list');
  if (!reportListEl) return;

  const reportsQuery = query(collection(db, "reportList"), orderBy("date", "desc"));

  onSnapshot(reportsQuery, (querySnapshot) => {
    let reportSummary = '';

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const status = data.statusReport || 'Pending';
      const firestoreDate = data.date?.toDate?.();

      if (currentStatusFilter !== "All" && status.toLowerCase() !== currentStatusFilter.toLowerCase()) return;

      if (firestoreDate) {
        if (currentStartDate && firestoreDate < currentStartDate) return;
        if (currentEndDate && firestoreDate > currentEndDate) return;
      }

      const formattedDate = firestoreDate
        ? firestoreDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'No Date';

      let actionButtons = '';
      if (status === "Pending") {
        actionButtons = `
          <button class="approve-btn-js status" data-id="${docSnap.id}">Approve</button>
          <button class="processing-btn-js status" data-id="${docSnap.id}">Processing</button>
          <button class="decline-btn-js status" data-id="${docSnap.id}">Decline</button>
        `;
      } else if (status === "Processing") {
        actionButtons = `
          <button class="approve-btn-js status" data-id="${docSnap.id}">Approve</button>
          <button class="decline-btn-js status" data-id="${docSnap.id}">Decline</button>
        `;
      } else {
        actionButtons = `<strong class="${status}">${status}</strong>`;
      }

      reportSummary += `
        <tr class="report-row"
            data-status="${status}"
            data-id="${docSnap.id}"
            data-full-name="${data.fullName}"
            data-date="${formattedDate}"
            data-location="${data.room} - ${data.pc}"
            data-product="${data.equipment}"
            data-img="${data.imageUrl || ''}"
            data-issue="${data.issue || 'No details provided'}"
            data-position="${data.position || 'Faculty'}">
          <td data-label="faculty name">${data.fullName}</td>
          <td data-label="date">${formattedDate}</td>
          <td data-label="Room & PC No.">${data.room} - ${data.pc}</td>
          <td data-label="unit">${data.equipment}</td>
          <td data-label="status"><span class="status status-span-row">${actionButtons}</span> </td>
          <td data-label="action"> <span class="view-details td-name-clickable" ><i class='bx bx-info-circle'></i> View Details</span>
          </td>
        </tr>
      `;
    });

    reportListEl.innerHTML = reportSummary;
    attachModalAndActionListeners();
    attachEventListeners();  // Re-bind action buttons after DOM update
  });
}

function attachModalAndActionListeners() {
  document.querySelectorAll('.td-name-clickable').forEach(cell => {
    cell.addEventListener('click', async () => {
      const row = cell.closest('.report-row');
      const { fullName, date, location, product, issue, position, img, status } = row.dataset;
      const imageSrc = img ? img : 'https://firebasestorage.googleapis.com/v0/b/labsystem-481dc.firebasestorage.app/o/icon%2FnoImage.png?alt=media&token=a6517e64-7d82-4959-b7a9-96b20651864d';


      let modal = document.querySelector('.details-modal');

      if (!modal) {
        modal = document.createElement('div');
        modal.classList.add('details-modal');
        document.body.appendChild(modal);
      }
      
      modal.innerHTML = `
      <div class="details-modal-content">
  <div class="details-modal-header">
    <h3 class="details-modal-title">Report Details</h3>
    <button class="details-modal-close">&times;</button>
  </div>
  <div class="details-modal-body">
    <div class="details-wrapper">
      <div class="details-left">
      
        <div class="detail-row">
          <span class="detail-label">Name:</span>
          <span class="detail-value">${fullName} (${position})</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status:</span>
          <span class="detail-value">${status}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date Submitted:</span>
          <span class="detail-value">${date}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Room & PC:</span>
          <span class="detail-value">${location}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Item Type:</span>
          <span class="detail-value">${product}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Issue:</span>
          <span class="detail-value">${issue}</span>
        </div>
      </div>
      <div class="details-right">
        <img src="${imageSrc}" alt="Report Image" class="report-image" />
      </div>
    </div>
  </div>
</div>

      `;
      document.body.appendChild(modal);

      modal.classList.add('active');

      const closeButton = modal.querySelector('.details-modal-close');
      closeButton.addEventListener('click', () => {
        modal.classList.remove('active');
      });

      // Optional: close modal when clicking outside
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });
  });
}

const updateStatus = async (id, status, button) => {
  try {
    const reportRef = doc(db, "reportList", id);
    await updateDoc(reportRef, { statusReport: status });

    if (status === "Approved") {
      const reportSnap = await getDoc(reportRef);
      if (!reportSnap.exists()) {
        console.error(`❌ Report with ID ${id} not found`);
        return;
      }

      const reportData = reportSnap.data();
      const { pc, room, equipment, issue, date } = reportData;

      const formattedDate = typeof date === "object" && date.toDate
        ? `${date.toDate().toLocaleString('en-US', {
            timeZone: 'Asia/Manila',
            dateStyle: 'long',
            timeStyle: 'medium'
          })} UTC+8`
        : date;

      // Add new document to the pc subcollection
      const pcCollectionRef = collection(db, "comlabrooms", room.toString(), `pc${pc}`);
      await addDoc(pcCollectionRef, {
        equipment,
        issue,
        reportDate: formattedDate,
        statusReport: status,
        approvedDate: serverTimestamp()
      });

      console.log(`✅ New report added to /comlabrooms/${room}/pc${pc}/`);

      console.log("PC (from report):", pc, "type:", typeof pc);
      console.log("Room (from report):", room, "type:", typeof room);

      // Query all reports for this PC and room using number types (no String)
      const reportsQuery = query(
        collection(db, "reportList"),
        where("pc", "==", pc),
        where("room", "==", room)
      );
      const reportsSnapshot = await getDocs(reportsQuery);

      console.log(`Reports found: ${reportsSnapshot.size}`);

      if (reportsSnapshot.empty) {
        console.warn("⚠️ No reports found for this PC and room");
      }

      let allResolved = true;
      reportsSnapshot.forEach(doc => {
        const data = doc.data();
        const rStatus = data.statusReport;
        console.log(`Report ID: ${doc.id}, Status: ${rStatus}, pc: ${data.pc}, room: ${data.room}`);
        if (rStatus !== "Approved" && rStatus !== "Declined") {
          allResolved = false;
        }
      });

      console.log("allResolved =", allResolved);

      // Update the PC status based on whether all reports are resolved
      const pcRef = doc(db, "comlabrooms", room.toString(), `pc${pc}`, "document1");
      if (allResolved) {
        console.log(`✅ All reports resolved. Setting PC status to 'available'.`);
        await updateDoc(pcRef, { status: "available" });
      } else {
        console.log(`⏳ Some reports still pending. Setting PC status to 'not available'.`);
        await updateDoc(pcRef, { status: "not available" });
      }

    } else if (status === "Processing") {
      // Only set PC to not available when status is Processing
      const reportSnap = await getDoc(reportRef);
      if (!reportSnap.exists()) {
        console.error(`❌ Report with ID ${id} not found`);
        return;
      }
      const { pc, room } = reportSnap.data();
      const pcRef = doc(db, "comlabrooms", room.toString(), `pc${pc}`, "document1");
      await updateDoc(pcRef, { status: "not available" });
    }

    if (status === 'Processing') {
      button.remove();
    } else {
      button.parentElement.innerHTML = `<strong>${status}</strong>`;
    }
  } catch (err) {
    console.error(`❌ Failed to update status:`, err);
  }
};

/**
 * Attach event listeners for each button type.
 */
const attachEventListeners = () => {
  document.querySelectorAll('.approve-btn-js').forEach(button => {
    button.addEventListener('click', () => updateStatus(button.dataset.id, "Approved", button));
  });

  document.querySelectorAll('.processing-btn-js').forEach(button => {
    button.addEventListener('click', () => updateStatus(button.dataset.id, "Processing", button));
  });

  document.querySelectorAll('.decline-btn-js').forEach(button => {
    button.addEventListener('click', () => updateStatus(button.dataset.id, "Declined", button));
  });
};



// Event Listeners on DOM Load
document.addEventListener("DOMContentLoaded", () => {
  setupRealtimeListener();

  const filterSelect = document.querySelector('#sortingReequest');
  const startDateInput = document.querySelector('#startDate');
  const endDateInput = document.querySelector('#endDate');

  filterSelect.addEventListener('change', () => {
    const selected = filterSelect.value;
    if (selected === "process-sort") currentStatusFilter = "Processing";
    else if (selected === "pending-sort") currentStatusFilter = "Pending";
    else if (selected === "approve-sort") currentStatusFilter = "Approved";
    else if (selected === "decline-sort") currentStatusFilter = "Declined";
    else currentStatusFilter = "All";

    setupRealtimeListener();
  });

  const handleDateChange = () => {
    const startVal = startDateInput.value;
    const endVal = endDateInput.value;

    currentStartDate = startVal ? new Date(startVal) : null;
    currentEndDate = endVal ? new Date(endVal) : null;

    if (currentEndDate) currentEndDate.setHours(23, 59, 59, 999);
    setupRealtimeListener();
  };

  startDateInput.addEventListener("change", handleDateChange);
  endDateInput.addEventListener("change", handleDateChange);
});
