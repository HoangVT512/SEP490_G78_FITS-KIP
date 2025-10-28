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
import com.example.fitsforkip.data.remote.ApiClient;
import com.example.fitsforkip.data.remote.ApiService;
import com.example.fitsforkip.ui.login.LoginActivity;
import com.google.android.material.card.MaterialCardView;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.android.material.navigation.NavigationView;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
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

    private MaterialCardView cvNavHome;
    private MaterialCardView cvNavEquipment;
    private MaterialCardView cvNavHistory;
    private MaterialCardView cvNavLogout;

    private TextView tvHeaderEmployeeId;
    private TextView tvHeaderProductionLine;

    private FloatingActionButton fabDeleteAll;
    private FloatingActionButton fabSaveTemp;
    private ImageButton fabUpload;

    private String employeeId;
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
                    // Update adapter with equipment data
                    if (adapter != null) {
                        adapter.setEquipmentList(equipmentList);
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
        fabSaveTemp = findViewById(R.id.fab_save_temp);
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
        if (equipmentList == null || equipmentList.isEmpty()) {
            return;
        }
        List<Integer> equipmentIds = new ArrayList<>();
        for (Equipment eq : equipmentList) {
            equipmentIds.add(eq.getEquipmentId());
        }
        Executors.newSingleThreadExecutor().execute(() -> {
            AppDatabase db = AppDatabaseSingleton.getInstance(this);
            // LẤY TẤT CẢ INCIDENTS (cả synced và unsynced)
            List<IncidentHistoryEntity> entities = db.incidentHistoryDao().getAllIncidentsByEquipmentIds(equipmentIds);
            runOnUiThread(() -> {
                incidentList = entities;
                adapter.setIncidentList(incidentList);
                updateIncidentCount();
                updateUnsyncedCount();
            });
        });
    }

    private void setupRecyclerView() {
        adapter = new IncidentHistoryAdapter(incidentList, equipmentList, this::onDeleteIncident);
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

        fabSaveTemp.setOnClickListener(v -> {
            Toast.makeText(this, "Đã lưu tạm thời", Toast.LENGTH_SHORT).show();
        });

        fabUpload.setOnClickListener(v -> {
            uploadUnsyncedIncidents();
        });
    }

    private void uploadUnsyncedIncidents() {
        if (incidentList.isEmpty()) {
            Toast.makeText(this, "Không có sự cố nào để tải lên", Toast.LENGTH_SHORT).show();
            return;
        }

        SharedPreferences prefs = getSharedPreferences("AppPrefs", MODE_PRIVATE);
        String token = prefs.getString("token", null);

        if (token == null) {
            Toast.makeText(this, "Không tìm thấy token xác thực", Toast.LENGTH_SHORT).show();
            return;
        }

        ApiService apiService = ApiClient.getClient().create(ApiService.class);

        int uploadCount = 0;
        for (IncidentHistoryEntity entity : incidentList) {
            if (!entity.isSynced()) {
                uploadCount++;

                // LƯU incidentId trước khi gọi API
                final int incidentId = entity.getIncidentId();

                CreateIncidentRequest request = new CreateIncidentRequest();
                request.setEquipmentId(entity.getEquipmentId());
                request.setStartTime(formatDate(entity.getStartTime()));
                request.setEndTime(formatDate(entity.getEndTime()));
                request.setDuration(entity.getDuration());
                request.setTypeId(entity.getTypeId());
                request.setReason(entity.getReason());
                request.setSolution(entity.getSolution());
                request.setIssue(entity.getIssue());
                request.setStatus(entity.getStatus());
                request.setCreatedDate(formatDate(entity.getCreatedDate()));
                request.setReportedByUserId(entity.getReportedByUserId());
                request.setTechSupport(entity.isTechSupport());

                Call<ApiResponse<IncidentHistory>> call = apiService.createIncident("Bearer " + token, request);
                call.enqueue(new Callback<ApiResponse<IncidentHistory>>() {
                    @Override
                    public void onResponse(Call<ApiResponse<IncidentHistory>> call, Response<ApiResponse<IncidentHistory>> response) {
                        if (response.isSuccessful()) {
                            // SỬ DỤNG incidentId đã lưu
                            Executors.newSingleThreadExecutor().execute(() -> {
                                AppDatabase db = AppDatabaseSingleton.getInstance(IncidentHistoryActivity.this);
                                db.incidentHistoryDao().updateSyncedStatus(incidentId, true);

                                runOnUiThread(() -> {
                                    loadIncidentData(); // reload data
                                    android.util.Log.d("Upload", "Đã đồng bộ thành công ID=" + incidentId);
                                });
                            });
                        } else {
                            runOnUiThread(() -> {
                                android.util.Log.e("Upload", "Lỗi server: " + response.code() + " - " + response.message());
                                Toast.makeText(IncidentHistoryActivity.this, "Lỗi tải lên: " + response.message(), Toast.LENGTH_SHORT).show();
                            });
                        }
                    }

                    @Override
                    public void onFailure(Call<ApiResponse<IncidentHistory>> call, Throwable t) {
                        runOnUiThread(() -> {
                            android.util.Log.e("Upload", "Lỗi mạng: " + t.getMessage(), t);
                            Toast.makeText(IncidentHistoryActivity.this, "Lỗi mạng: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                        });
                    }
                });
            }
        }

        if (uploadCount > 0) {
            Toast.makeText(this, "Đang tải lên " + uploadCount + " sự cố chưa đồng bộ", Toast.LENGTH_SHORT).show();
        } else {
            Toast.makeText(this, "Tất cả sự cố đã được đồng bộ", Toast.LENGTH_SHORT).show();
        }
    }

    private String formatDate(Date date) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault());
        return sdf.format(date);
    }

    private void onDeleteIncident(int position) {
        IncidentHistoryEntity entity = incidentList.get(position);
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
}
