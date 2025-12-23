package com.example.fitsforkip.ui.incident;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.ActionBarDrawerToggle;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.core.view.GravityCompat;
import androidx.drawerlayout.widget.DrawerLayout;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.fitsforkip.R;
import com.example.fitsforkip.data.local.AppDatabase;
import com.example.fitsforkip.data.local.AppDatabaseSingleton;
import com.example.fitsforkip.data.local.IncidentHistoryEntity;
import com.example.fitsforkip.data.model.ApiResponse;
import com.example.fitsforkip.data.model.CreateIncidentRequest;
import com.example.fitsforkip.data.model.Equipment;
import com.example.fitsforkip.data.model.IncidentHistory;
import com.example.fitsforkip.data.model.CreateBulkIncidentRequest;
import com.example.fitsforkip.data.model.BulkIncidentResponse;
import com.example.fitsforkip.data.remote.ApiClient;
import com.example.fitsforkip.data.remote.ApiService;
import com.example.fitsforkip.ui.login.LoginActivity;
import com.google.android.material.card.MaterialCardView;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.android.material.navigation.NavigationView;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.Executors;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class IncidentHistoryActivity extends AppCompatActivity {

    private DrawerLayout drawerLayout;
    private NavigationView navigationView;
    private Toolbar toolbar;
    private RecyclerView rvIncidentHistory;
    private TextView tvIncidentCount, tvUnsyncedCount;
    private IncidentHistoryAdapter adapter;
    private List<IncidentHistoryEntity> incidentList = new ArrayList<>();
    private List<Equipment> equipmentList = new ArrayList<>();
    private List<String> lineList = new ArrayList<>();

    private MaterialCardView cvNavHome;
    private MaterialCardView cvNavEquipment;
    private MaterialCardView cvNavHistory;
    private MaterialCardView cvNavLogout;

    private TextView tvHeaderEmployeeId;
    private TextView tvHeaderProductionLine;

    private FloatingActionButton fabDeleteAll;
    //private FloatingActionButton fabSaveTemp;
    private ImageButton fabUpload;

    private String employeeId;
    private String userId;
    private String productionLine;
    private int lineId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_incident_history);

        loadUserData();
        loadEquipmentList();
        initViews();
        setupToolbarAndDrawer();
        setupRecyclerView();
        updateIncidentCount();
        updateUserInfo();
        setupNavListeners();
        setupFabListeners();
        updateUnsyncedCount();
    }

    private void loadUserData() {
        SharedPreferences prefs = getSharedPreferences("AppPrefs", MODE_PRIVATE);
        employeeId = prefs.getString("employee_id", "Unknown");
        userId = prefs.getString("user_id", null);
        productionLine = prefs.getString("production_line", "Unknown");
        lineId = prefs.getInt("line_id", -1);
    }

    private void loadEquipmentList() {
        SharedPreferences prefs = getSharedPreferences("AppPrefs", MODE_PRIVATE);
        String token = prefs.getString("token", null);
        int lineId = prefs.getInt("line_id", -1);

        if (token == null || lineId == -1) {
            Toast.makeText(this, "Không tìm thấy thông tin xác thực", Toast.LENGTH_SHORT).show();
            return;
        }

        ApiService apiService = ApiClient.getClient().create(ApiService.class);
        Call<ApiResponse<List<Equipment>>> call = apiService.getEquipmentsByLine("Bearer " + token, lineId);
        call.enqueue(new Callback<ApiResponse<List<Equipment>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Equipment>>> call, Response<ApiResponse<List<Equipment>>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    equipmentList = response.body().getData();

                    lineList.clear();
                    lineList.add(productionLine); // Chỉ có 1 dây chuyền đang làm việc

                    // Update adapter with equipment data
                    if (adapter != null) {
                        adapter.setEquipmentList(equipmentList);

                        adapter.setLineList(lineList); // Truyền lineList
                    }
                    // Now load incidents after equipment is loaded
                    loadIncidentData();
                } else {
                    //Toast.makeText(IncidentHistoryActivity.this, "Không thể tải danh sách thiết bị", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Equipment>>> call, Throwable t) {
                Toast.makeText(IncidentHistoryActivity.this, "Lỗi: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void initViews() {
        toolbar = findViewById(R.id.toolbar);
        drawerLayout = findViewById(R.id.drawer_layout);
        navigationView = findViewById(R.id.nav_view);
        rvIncidentHistory = findViewById(R.id.rv_incident_history);
        tvIncidentCount = findViewById(R.id.tv_incident_count);
        tvUnsyncedCount = findViewById(R.id.tv_unsynced_count);

        // Navigation header
        View headerView = navigationView.getHeaderView(0);
        tvHeaderEmployeeId = headerView.findViewById(R.id.tv_header_employee_id);
        tvHeaderProductionLine = headerView.findViewById(R.id.tv_header_production_line);

        // Navigation cards
        cvNavHome = headerView.findViewById(R.id.cv_nav_home);
        cvNavEquipment = headerView.findViewById(R.id.cv_nav_equipment);
        cvNavHistory = headerView.findViewById(R.id.cv_nav_history);
        cvNavLogout = headerView.findViewById(R.id.cv_nav_logout);

        // Upload button in toolbar
        ImageButton btnUploadToolbar = findViewById(R.id.btn_upload_toolbar);
        btnUploadToolbar.setOnClickListener(v -> {
            Toast.makeText(this, getString(R.string.uploading_toast), Toast.LENGTH_SHORT).show();
        });

        // FABs
        fabDeleteAll = findViewById(R.id.fab_delete_all);
        //fabSaveTemp = findViewById(R.id.fab_save_temp);
        fabUpload = findViewById(R.id.btn_upload_toolbar);
    }

    private void setupToolbarAndDrawer() {
        setSupportActionBar(toolbar);

        ActionBarDrawerToggle toggle = new ActionBarDrawerToggle(
                this, drawerLayout, toolbar,
                R.string.navigation_drawer_open,
                R.string.navigation_drawer_close);
        toggle.getDrawerArrowDrawable().setColor(getResources().getColor(android.R.color.white));
        drawerLayout.addDrawerListener(toggle);
        toggle.syncState();
    }

    private void loadIncidentData() {
        if (lineId == -1) {
            return;
        }
        Executors.newSingleThreadExecutor().execute(() -> {
            AppDatabase db = AppDatabaseSingleton.getInstance(this);
            // LẤY TẤT CẢ INCIDENTS CỦA LINE (CẢ SYNCED VÀ UNSYNCED)
            List<IncidentHistoryEntity> entities = db.incidentHistoryDao().getIncidentsByLineId(lineId);
            runOnUiThread(() -> {
                incidentList = entities;
                adapter.setIncidentList(incidentList);
                updateIncidentCount();
                updateUnsyncedCount();
            });
        });
    }

    private void setupRecyclerView() {
        //adapter = new IncidentHistoryAdapter(incidentList, equipmentList, this::onDeleteIncident);
        adapter = new IncidentHistoryAdapter(incidentList, equipmentList, lineList, this::onDeleteIncident);
        rvIncidentHistory.setLayoutManager(new LinearLayoutManager(this));
        rvIncidentHistory.setAdapter(adapter);
    }

    private void updateIncidentCount() {
        tvIncidentCount.setText(String.valueOf(incidentList.size()));
    }

    private void updateUnsyncedCount() {
        if (equipmentList == null || equipmentList.isEmpty()) {
            tvUnsyncedCount.setText("0");
            return;
        }
        List<Integer> equipmentIds = new ArrayList<>();
        for (Equipment eq : equipmentList) {
            equipmentIds.add(eq.getEquipmentId());
        }
        Executors.newSingleThreadExecutor().execute(() -> {
            AppDatabase db = AppDatabaseSingleton.getInstance(this);
            int count = db.incidentHistoryDao().getUnsyncedCountByEquipmentIds(equipmentIds);
            runOnUiThread(() -> {
                tvUnsyncedCount.setText(String.valueOf(count));
            });
        });
    }

    private void updateUserInfo() {
        tvHeaderEmployeeId.setText("Mã NV: " + employeeId);
        tvHeaderProductionLine.setText(productionLine);
    }

    private void setupNavListeners() {
        cvNavHome.setOnClickListener(v -> {
            Intent intent = new Intent(this, com.example.fitsforkip.ui.home.HomeActivity.class);
            startActivity(intent);
            drawerLayout.closeDrawer(GravityCompat.START);
        });

        cvNavEquipment.setOnClickListener(v -> {
            // Chuyển đến EquipmentListActivity
            Intent intent = new Intent(this, com.example.fitsforkip.ui.equipment.EquipmentListActivity.class);
            startActivity(intent);
            drawerLayout.closeDrawer(GravityCompat.START);
        });

        cvNavHistory.setOnClickListener(v -> {
            // Đang ở trang Incident History
            drawerLayout.closeDrawer(GravityCompat.START);
        });

        cvNavLogout.setOnClickListener(v -> {
            showLogoutDialog();
        });
    }

    private void setupFabListeners() {
        fabDeleteAll.setOnClickListener(v -> {
            new AlertDialog.Builder(this)
                    .setTitle("Xóa tất cả")
                    .setMessage("Bạn có chắc chắn muốn xóa tất cả sự cố của dây chuyền này?")
                    .setPositiveButton("Xóa", (dialog, which) -> {
                        if (equipmentList == null || equipmentList.isEmpty()) {
                            Toast.makeText(this, "Không có thiết bị nào", Toast.LENGTH_SHORT).show();
                            return;
                        }
                        List<Integer> equipmentIds = new ArrayList<>();
                        for (Equipment eq : equipmentList) {
                            equipmentIds.add(eq.getEquipmentId());
                        }
                        Executors.newSingleThreadExecutor().execute(() -> {
                            AppDatabase db = AppDatabaseSingleton.getInstance(this);
                            db.incidentHistoryDao().deleteAll();
                            runOnUiThread(() -> {
                                loadIncidentData(); // Reload the filtered list
                            });
                        });
                    })
                    .setNegativeButton("Hủy", null)
                    .show();
        });

//        fabSaveTemp.setOnClickListener(v -> {
//            Toast.makeText(this, "Đã lưu tạm thời", Toast.LENGTH_SHORT).show();
//        });

        fabUpload.setOnClickListener(v -> {
            uploadUnsyncedIncidents();
        });
    }

    private void uploadUnsyncedIncidents() {
        if (incidentList.isEmpty()) {
            Toast.makeText(this, "Không có bản ghi nào để tải lên", Toast.LENGTH_SHORT).show();
            return;
        }

        SharedPreferences prefs = getSharedPreferences("AppPrefs", MODE_PRIVATE);
        String token = prefs.getString("token", null);

        if (token == null) {
            Toast.makeText(this, "Không tìm thấy token xác thực", Toast.LENGTH_SHORT).show();
            return;
        }

        // Collect unsynced incidents
        List<IncidentHistoryEntity> unsyncedIncidents = new ArrayList<>();
        for (IncidentHistoryEntity entity : incidentList) {
            if (!entity.isSynced()) {
                unsyncedIncidents.add(entity);
            }
        }

        if (unsyncedIncidents.isEmpty()) {
            Toast.makeText(this, "Tất cả bản ghi đã được đồng bộ", Toast.LENGTH_SHORT).show();
            return;
        }

        // ← SỬA: Upload từng incident riêng lẻ thay vì bulk
        // Khi upload xong (success/failure), reload data để hiển thị trạng thái mới
        uploadIncidentsSequentially(unsyncedIncidents, token, 0);

        // Prepare bulk request
//        List<CreateIncidentRequest> incidentRequests = new ArrayList<>();
//        for (IncidentHistoryEntity entity : unsyncedIncidents) {
//            CreateIncidentRequest request = new CreateIncidentRequest();
//            request.setEquipmentId(entity.getEquipmentId());
//            request.setLineId(lineId); // Add lineId
//            request.setStartTime(formatDate(entity.getStartTime()));
//            //request.setEndTime(formatDate(entity.getEndTime()));
//            // FIX: Kiểm tra null cho endTime
//            if (entity.getEndTime() != null) {
//                request.setEndTime(formatDate(entity.getEndTime()));
//            } else {
//                // Nếu endTime null (technical support pending), không set endTime
//                request.setEndTime(null);
//            }
//            // Recalculate duration with break deduction and floor
//            double adjustedDuration = calculateDurationWithBreakDeduction(entity.getStartTime(), entity.getEndTime());
//            double roundedDuration = Math.floor(adjustedDuration * 100) / 100;
//            request.setDuration(roundedDuration);
//            request.setTypeId(entity.getTypeId());
//            request.setReason(entity.getReason());
//            request.setSolution(entity.getSolution());
//            request.setIssue(entity.getIssue());
//            request.setStatus(entity.getStatus());
//            request.setCreatedDate(formatDate(entity.getCreatedDate()));
//            request.setReportedByUserId(userId);
//            request.setTechSupport(entity.isTechSupport());
//            request.setImageUrls(entity.getImageUrls());
//            incidentRequests.add(request);
//        }
//
//        CreateBulkIncidentRequest bulkRequest = new CreateBulkIncidentRequest();
//        bulkRequest.setIncidents(incidentRequests);
//
//        ApiService apiService = ApiClient.getClient().create(ApiService.class);
//        Call<ApiResponse<BulkIncidentResponse>> call = apiService.createBulkIncidents("Bearer " + token, bulkRequest);
//        call.enqueue(new Callback<ApiResponse<BulkIncidentResponse>>() {
//            @Override
//            public void onResponse(Call<ApiResponse<BulkIncidentResponse>> call, Response<ApiResponse<BulkIncidentResponse>> response) {
//                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
//                    BulkIncidentResponse bulkResponse = response.body().getData();
//                    if (bulkResponse.getSuccessCount() > 0) {
//                        // Update synced status for all unsynced incidents
//                        Executors.newSingleThreadExecutor().execute(() -> {
//                            AppDatabase db = AppDatabaseSingleton.getInstance(IncidentHistoryActivity.this);
//                            for (IncidentHistoryEntity entity : unsyncedIncidents) {
//                                db.incidentHistoryDao().updateSyncedStatus(entity.getIncidentId(), true);
//                            }
//                            runOnUiThread(() -> {
//                                loadIncidentData(); // reload data
//                                Toast.makeText(IncidentHistoryActivity.this, "Đã đồng bộ " + bulkResponse.getSuccessCount() + " bản ghi dữ liệu thành công", Toast.LENGTH_SHORT).show();
//                            });
//                        });
//                    } else {
//                        runOnUiThread(() -> {
//                            Toast.makeText(IncidentHistoryActivity.this, "Không thể đồng bộ: " + bulkResponse.getErrors().get(0).getErrorMessage(), Toast.LENGTH_SHORT).show();
//                        });
//                    }
//                } else {
//                    runOnUiThread(() -> {
//                        Toast.makeText(IncidentHistoryActivity.this, "Lỗi server: " + response.message(), Toast.LENGTH_SHORT).show();
//                    });
//                }
//            }
//
//            @Override
//            public void onFailure(Call<ApiResponse<BulkIncidentResponse>> call, Throwable t) {
//                runOnUiThread(() -> {
//                    Toast.makeText(IncidentHistoryActivity.this, "Lỗi mạng: " + t.getMessage(), Toast.LENGTH_SHORT).show();
//                });
//            }
//        });
    }

    // ← THÊM method mới: Upload incidents một cái một cái
    private void uploadIncidentsSequentially(List<IncidentHistoryEntity> unsyncedIncidents, String token, int index) {
        // Base case: đã upload hết toàn bộ
        if (index >= unsyncedIncidents.size()) {
            // Reload lại data để hiển thị trạng thái sync mới nhất
            loadIncidentData();
            Toast.makeText(this, "Hoàn thành quá trình đồng bộ", Toast.LENGTH_SHORT).show();
            return;
        }

        IncidentHistoryEntity entity = unsyncedIncidents.get(index);

        // Prepare request cho incident này
        CreateIncidentRequest request = new CreateIncidentRequest();
        request.setEquipmentId(entity.getEquipmentId());
        request.setLineId(lineId);
        request.setStartTime(formatDate(entity.getStartTime()));

        // FIX: Kiểm tra null cho endTime
        if (entity.getEndTime() != null) {
            request.setEndTime(formatDate(entity.getEndTime()));
        } else {
            request.setEndTime(null);
        }

        // Recalculate duration with break deduction
        double adjustedDuration = calculateDurationWithBreakDeduction(entity.getStartTime(), entity.getEndTime());
        double roundedDuration = Math.floor(adjustedDuration * 100) / 100;
        request.setDuration(roundedDuration);
        request.setTypeId(entity.getTypeId());
        request.setReason(entity.getReason());
        request.setSolution(entity.getSolution());
        request.setIssue(entity.getIssue());
        request.setStatus(entity.getStatus());
        request.setCreatedDate(formatDate(entity.getCreatedDate()));
        request.setReportedByUserId(userId);
        request.setTechSupport(entity.isTechSupport());
        request.setImageUrls(entity.getImageUrls());

        // ← SỬA: Upload từng cái một (không phải bulk)
        CreateBulkIncidentRequest bulkRequest = new CreateBulkIncidentRequest();
        bulkRequest.setIncidents(java.util.Arrays.asList(request)); // Chỉ 1 request

        ApiService apiService = ApiClient.getClient().create(ApiService.class);
        Call<ApiResponse<BulkIncidentResponse>> call = apiService.createBulkIncidents("Bearer " + token, bulkRequest);

        final int currentIndex = index;
        call.enqueue(new Callback<ApiResponse<BulkIncidentResponse>>() {
            @Override
            public void onResponse(Call<ApiResponse<BulkIncidentResponse>> call, Response<ApiResponse<BulkIncidentResponse>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    BulkIncidentResponse bulkResponse = response.body().getData();
                    if (bulkResponse.getSuccessCount() > 0) {
                        // ← UPLOAD THÀNH CÔNG: Cập nhật synced status cho record này
                        Executors.newSingleThreadExecutor().execute(() -> {
                            AppDatabase db = AppDatabaseSingleton.getInstance(IncidentHistoryActivity.this);
                            db.incidentHistoryDao().updateSyncedStatus(entity.getIncidentId(), true);
                        });
                    }
                    // Dù success hay failure, tiếp tục upload record tiếp theo
                    uploadIncidentsSequentially(unsyncedIncidents, token, currentIndex + 1);
                } else {
                    // ← UPLOAD THẤT BẠI: Giữ lại record này (không update synced status)
                    // Tiếp tục upload record tiếp theo
                    if (response.body() != null && response.body().getData() != null &&
                            !response.body().getData().getErrors().isEmpty()) {
                        String errorMsg = response.body().getData().getErrors().get(0).getErrorMessage();
                        //Toast.makeText(IncidentHistoryActivity.this, "Record " + (currentIndex + 1) + " lỗi: " + errorMsg, Toast.LENGTH_SHORT).show();
                    }
                    uploadIncidentsSequentially(unsyncedIncidents, token, currentIndex + 1);
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<BulkIncidentResponse>> call, Throwable t) {
                // ← NETWORK ERROR: Giữ lại record này
                // Tiếp tục upload record tiếp theo
                //Toast.makeText(IncidentHistoryActivity.this, "Record " + (currentIndex + 1) + " lỗi mạng: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                uploadIncidentsSequentially(unsyncedIncidents, token, currentIndex + 1);
            }
        });
    }

    private String formatDate(Date date) {
        // FIX: Kiểm tra null trước khi format
        if (date == null) {
            return null;
        }

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault());
        return sdf.format(date);
    }

    private void onDeleteIncident(IncidentHistoryEntity entity) {
        int position = incidentList.indexOf(entity);
        if (position == -1) return; // Entity not found, perhaps already deleted

        new AlertDialog.Builder(this)
                .setTitle("Xóa sự cố")
                .setMessage("Bạn có chắc chắn muốn xóa sự cố này?")
                .setPositiveButton("Xóa", (dialog, which) -> {
                    Executors.newSingleThreadExecutor().execute(() -> {
                        AppDatabase db = AppDatabaseSingleton.getInstance(this);
                        db.incidentHistoryDao().deleteById(entity.getIncidentId());
                        runOnUiThread(() -> {
                            incidentList.remove(position);
                            adapter.notifyItemRemoved(position);
                            updateIncidentCount();
                            updateUnsyncedCount();
                            Toast.makeText(this, "Đã xóa sự cố", Toast.LENGTH_SHORT).show();
                        });
                    });
                })
                .setNegativeButton("Hủy", null)
                .show();
    }

    private void showLogoutDialog() {
        new AlertDialog.Builder(this)
                .setTitle("Đăng xuất")
                .setMessage("Bạn có chắc chắn muốn đăng xuất?")
                .setPositiveButton("Đăng xuất", (dialog, which) -> logout())
                .setNegativeButton("Hủy", null)
                .show();
    }

    private void logout() {
        // Clear login info
        getSharedPreferences("AppPrefs", MODE_PRIVATE)
                .edit()
                .clear()
                .apply();

        // Go to Login
        Intent intent = new Intent(this, LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();

        Toast.makeText(this, "Đã đăng xuất", Toast.LENGTH_SHORT).show();
    }

    @Override
    public void onBackPressed() {
        if (drawerLayout.isDrawerOpen(GravityCompat.START)) {
            drawerLayout.closeDrawer(GravityCompat.START);
        } else {
            super.onBackPressed();
        }
    }

    private double calculateDurationWithBreakDeduction(Date startTime, Date endTime) {
        if (endTime == null) {
            return 0.0;
        }

        // Giờ làm việc: 7:00 - 23:00
        Calendar workStart = Calendar.getInstance();
        workStart.setTime(startTime);
        workStart.set(Calendar.HOUR_OF_DAY, 7);
        workStart.set(Calendar.MINUTE, 0);
        workStart.set(Calendar.SECOND, 0);
        workStart.set(Calendar.MILLISECOND, 0);

        Calendar workEnd = Calendar.getInstance();
        workEnd.setTime(startTime);
        workEnd.set(Calendar.HOUR_OF_DAY, 23);
        workEnd.set(Calendar.MINUTE, 0);
        workEnd.set(Calendar.SECOND, 0);
        workEnd.set(Calendar.MILLISECOND, 0);

        // CHỈ TÍNH thời gian trong khoảng 7:00 - 23:00
        long effectiveStart = Math.max(startTime.getTime(), workStart.getTimeInMillis());
        long effectiveEnd = Math.min(endTime.getTime(), workEnd.getTimeInMillis());

        if (effectiveStart >= effectiveEnd) {
            return 0.0; // Không có thời gian hợp lệ
        }

        double validMinutes = (effectiveEnd - effectiveStart) / (1000.0 * 60.0);

        // Trừ break time nếu overlap
        Date effectiveStartDate = new Date(effectiveStart);
        Date effectiveEndDate = new Date(effectiveEnd);

        double break1Overlap = calculateBreakOverlap(effectiveStartDate, effectiveEndDate, 11, 0, 11, 30);
        double break2Overlap = calculateBreakOverlap(effectiveStartDate, effectiveEndDate, 18, 0, 18, 30);

        return Math.max(0.0, validMinutes - break1Overlap - break2Overlap);
    }

    private double calculateBreakOverlap(Date startTime, Date endTime, int breakStartHour, int breakStartMinute, int breakEndHour, int breakEndMinute) {
        // Tạo Date cho break start và end trong cùng ngày với startTime
        Calendar breakStart = Calendar.getInstance();
        breakStart.setTime(startTime);
        breakStart.set(Calendar.HOUR_OF_DAY, breakStartHour);
        breakStart.set(Calendar.MINUTE, breakStartMinute);
        breakStart.set(Calendar.SECOND, 0);
        breakStart.set(Calendar.MILLISECOND, 0);

        Calendar breakEnd = Calendar.getInstance();
        breakEnd.setTime(startTime);
        breakEnd.set(Calendar.HOUR_OF_DAY, breakEndHour);
        breakEnd.set(Calendar.MINUTE, breakEndMinute);
        breakEnd.set(Calendar.SECOND, 0);
        breakEnd.set(Calendar.MILLISECOND, 0);

        // Nếu break end < break start, nghĩa là qua ngày hôm sau
        if (breakEnd.before(breakStart)) {
            breakEnd.add(Calendar.DAY_OF_MONTH, 1);
        }

        long overlapStart = Math.max(startTime.getTime(), breakStart.getTimeInMillis());
        long overlapEnd = Math.min(endTime.getTime(), breakEnd.getTimeInMillis());

        if (overlapStart < overlapEnd) {
            return (overlapEnd - overlapStart) / (1000.0 * 60.0);
        } else {
            return 0.0;
        }
    }
}
