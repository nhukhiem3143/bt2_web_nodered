/* ---------- Helpers ---------- */
// bỏ dấu tiếng Việt
function boDauTiengViet(str = "") {
  return String(str).normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
}

// tiện: lấy base URL cho API (nếu cần đổi host)
const API_BASE = "http://localhost:1880";

/* ---------- MẶC ĐỊNH: HIỂN THỊ DANH SÁCH (MAIN VIEW) ---------- */
async function timKiem() {
  const keyword = document.getElementById("keyword").value.trim();
  const url = `${API_BASE}/timkiem?q=${encodeURIComponent(keyword)}`;
  const container = document.getElementById("ketqua");
  container.innerHTML = "⏳ Đang tải...";

  try {
    const res = await fetch(url);
    const data = await res.json();
    const kw = boDauTiengViet(keyword);

    const list = keyword ? data.filter(sp => 
      boDauTiengViet(sp.TenSP).includes(kw) || boDauTiengViet(sp.LoaiSP).includes(kw)
    ) : data;

    renderMainList(list);
  } catch (e) {
    container.innerHTML = "⚠️ Lỗi khi tải danh sách";
    console.error(e);
  }
}

function renderMainList(list) {
  const container = document.getElementById("ketqua");
  if (!Array.isArray(list) || list.length === 0) {
    container.innerHTML = "<p>Không có sản phẩm.</p>";
    return;
  }
  container.innerHTML = list.map(sp => `
    <div class="product">
      <img src="http://nguyennhukhiem.com/${sp.HinhAnh}?v=${Date.now()}" alt="${escapeHtml(sp.TenSP)}">
      <h3>${escapeHtml(sp.TenSP)}</h3>
      <p><strong>${Number(sp.Gia).toLocaleString()}₫</strong></p>
      <p>Loại: ${escapeHtml(sp.LoaiSP)}</p>
    </div>
  `).join("");
}

/* simple escape để tránh injection trong innerHTML */
function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[s]);
}

/* ---------- MODAL CRUD ---------- */
const modal = document.getElementById("crudModal");
const menuBtn = document.getElementById("menuBtn");
const modalClose = document.getElementById("modalClose");
const btnAddRow = document.getElementById("btnAddRow");
const btnRefreshTable = document.getElementById("btnRefreshTable");
const tbody = document.querySelector("#bangSanPham tbody");

menuBtn.addEventListener("click", openModal);
modalClose.addEventListener("click", closeModal);
btnRefreshTable.addEventListener("click", loadTableData);
btnAddRow.addEventListener("click", addEmptyRowAtTop);

// mở modal và tải dữ liệu
function openModal() {
  modal.setAttribute("aria-hidden", "false");
  modal.style.display = "flex";
  loadTableData();
}

// Thêm sự kiện để đóng modal khi nhấn ra ngoài
modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

// Cập nhật hàm closeModal để reset nút đóng
function closeModal() {
  modal.setAttribute("aria-hidden", "true");
  modal.style.display = "none";
  modalClose.disabled = false; // Kích hoạt lại nút đóng
}

// Cập nhật sự kiện cho nút đóng
modalClose.addEventListener("click", () => {
  modalClose.disabled = true; // Vô hiệu hóa nút đóng khi nhấn
  closeModal();
});

/* tải danh sách từ API để hiển thị quản lý */
async function loadTableData() {
  tbody.innerHTML = `<tr><td colspan="7">⏳ Đang tải...</td></tr>`;
  try {
    const res = await fetch(`${API_BASE}/timkiem`);
    const data = await res.json();
    renderTableRows(data);
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="7">⚠️ Lỗi tải dữ liệu</td></tr>`;
    console.error(e);
  }
}

/* render bảng: mỗi row ở chế độ view; edit được bật khi nhấn 'Sửa' */
function renderTableRows(list) {
  if (!Array.isArray(list) || list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7">Không có sản phẩm</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(sp => `
    <tr data-id="${sp.MaSP}">
      <td class="cell-name">${escapeHtml(sp.TenSP)}</td>
      <td class="cell-loai">${escapeHtml(sp.LoaiSP)}</td>
      <td class="cell-gia">${escapeHtml(sp.Gia)}</td>
      <td class="cell-sl">${escapeHtml(sp.SoLuong)}</td>
      <td class="cell-mota">${escapeHtml(sp.MoTa || "")}</td>
      <td class="cell-img"><img src="http://nguyennhukhiem.com/${sp.HinhAnh}?v=${Date.now()}" alt="${escapeHtml(sp.TenSP)}" width="60"></td>
      <td class="row-actions">
        <button class="edit-btn" onclick="startEditRow(this)">Sửa</button>
        <button class="del-btn" onclick="deleteRow(${sp.MaSP})">Xóa</button>
      </td>
    </tr>
  `).join("");
  console.log("Số cột render:", document.querySelectorAll("#bangSanPham tr:first-child td").length); // Debug số cột
}

/* Thêm một hàng trống (editable) ở top để nhập thêm mới */
function addEmptyRowAtTop() {
  if (tbody.querySelector('tr.adding')) return;

  const tr = document.createElement('tr');
  tr.classList.add('adding');
  tr.innerHTML = `
    <td><input type="text" class="in-name" placeholder="Tên sản phẩm"></td>
    <td><input type="text" class="in-loai" placeholder="Loại"></td>
    <td><input type="number" class="in-gia" placeholder="Giá"></td>
    <td><input type="number" class="in-sl" placeholder="Số lượng"></td>
    <td><input type="text" class="in-mota" placeholder="Mô tả"></td>
    <td><input type="file" class="in-file" accept="image/*"></td>
    <td>
      <button class="save-btn" onclick="saveNewRow(this)">Lưu</button>
      <button class="cancel-btn" onclick="cancelAddRow(this)">Huỷ</button>
    </td>
  `;
  tbody.prepend(tr);
  tr.querySelector('.in-name').focus();
}

function cancelAddRow(btn) {
  const tr = btn.closest('tr');
  tr.remove();
}

/* Lưu hàng mới -> gọi POST /sanpham (JSON) */
async function saveNewRow(btn) {
  const tr = btn.closest('tr');
  const TenSP = tr.querySelector('.in-name').value.trim();
  const LoaiSP = tr.querySelector('.in-loai').value.trim();
  const Gia = tr.querySelector('.in-gia').value;
  const SoLuong = tr.querySelector('.in-sl').value;
  const MoTa = tr.querySelector('.in-mota').value.trim();
  const fileInput = tr.querySelector('.in-file');

  if (!TenSP || !LoaiSP) return alert('Tên và Loại là bắt buộc');

  const data = new FormData();
  data.append('TenSP', TenSP);
  data.append('LoaiSP', LoaiSP);
  data.append('Gia', Gia || 0);
  data.append('SoLuong', SoLuong || 0);
  data.append('MoTa', MoTa);

  if (fileInput && fileInput.files[0]) {
    data.append('HinhAnh', fileInput.files[0]);
  }

  try {
    const res = await fetch(`${API_BASE}/sanpham`, {
      method: 'POST',
      body: data
    });
    if (!res.ok) throw new Error('Thêm thất bại');
    await loadTableData();
    await timKiem();
    alert('Thêm thành công');
  } catch (e) {
    console.error(e);
    alert('Lỗi khi thêm sản phẩm');
  }
}

/* Bắt đầu chỉnh sửa 1 dòng: thay các cell bằng input */
function startEditRow(btn) {
  const tr = btn.closest('tr');
  if (tbody.querySelector('tr.editing')) return alert('Vui lòng lưu hoặc hủy chỉnh sửa đang mở trước');

  tr.classList.add('editing');

  const name = tr.querySelector('.cell-name').innerText;
  const loai = tr.querySelector('.cell-loai').innerText;
  const gia = tr.querySelector('.cell-gia').innerText;
  const sl = tr.querySelector('.cell-sl').innerText;
  const mota = tr.querySelector('.cell-mota').innerText;

  tr.querySelector('.cell-name').innerHTML = `<input type="text" class="edit-name" value="${escapeAttr(name)}">`;
  tr.querySelector('.cell-loai').innerHTML = `<input type="text" class="edit-loai" value="${escapeAttr(loai)}">`;
  tr.querySelector('.cell-gia').innerHTML = `<input type="number" class="edit-gia" value="${escapeAttr(gia)}">`;
  tr.querySelector('.cell-sl').innerHTML = `<input type="number" class="edit-sl" value="${escapeAttr(sl)}">`;
  tr.querySelector('.cell-mota').innerHTML = `<input type="text" class="edit-mota" value="${escapeAttr(mota)}">`;
  tr.querySelector('.cell-img').innerHTML = `<img src="http://nguyennhukhiem.com/${tr.querySelector('.cell-img img').src.split('/').pop()}" alt="${escapeAttr(name)}" width="60">`; // Giữ ảnh hiện tại

  tr.querySelector('.row-actions').innerHTML = `
    <button class="save-btn" onclick="saveEditRow(this)">Lưu</button>
    <button class="cancel-btn" onclick="cancelEditRow(this)">Hủy</button>
  `;
}

function escapeAttr(s) {
  return String(s || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* Hủy edit: trả lại giá trị cũ bằng cách reload table row từ API */
async function cancelEditRow(btn) {
  const tr = btn.closest('tr');
  const id = tr.getAttribute('data-id');
  try {
    await loadTableData();
  } catch (e) {
    console.error(e);
    alert('Không thể hủy chỉnh sửa (lỗi tải lại)');
  }
}

/* Lưu thay đổi row -> PUT /sanpham/:id (JSON) */
async function saveEditRow(btn) {
  const tr = btn.closest('tr');
  const id = tr.getAttribute('data-id');
  const TenSP = tr.querySelector('.edit-name').value.trim();
  const LoaiSP = tr.querySelector('.edit-loai').value.trim();
  const Gia = tr.querySelector('.edit-gia').value.trim();
  const SoLuong = tr.querySelector('.edit-sl').value.trim();
  const MoTa = tr.querySelector('.edit-mota').value.trim();

  if (!TenSP || !LoaiSP) return alert('Tên và Loại là bắt buộc');

  const data = {
    TenSP,
    LoaiSP,
    Gia: Gia || null,
    SoLuong: SoLuong || null,
    MoTa: MoTa || null
  };

  console.log('Dữ liệu gửi đi:', data); // Debug

  try {
    const res = await fetch(`${API_BASE}/sanpham/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Cập nhật thất bại');
    alert('Cập nhật thành công');
    await loadTableData();
    await timKiem();
  } catch (e) {
    console.error(e);
    alert('Lỗi khi cập nhật: ' + e.message);
  }
}

/* Xóa 1 product -> DELETE /sanpham/:id */
async function deleteRow(id) {
  if (!confirm('Bạn có chắc muốn xóa?')) return;
  try {
    const res = await fetch(`${API_BASE}/sanpham/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Xóa thất bại');
    alert('Xóa thành công');
    await loadTableData();
    await timKiem();
  } catch (e) {
    console.error(e);
    alert('Lỗi khi xóa');
  }
}


/* ---------- Init ---------- */
document.getElementById('searchBtn').addEventListener('click', timKiem);
// Enter cho search
document.getElementById('keyword').addEventListener('keypress', e => { if (e.key === 'Enter') timKiem(); });

// Khi load trang, hiển thị main list
window.addEventListener('load', () => {
  timKiem();
});