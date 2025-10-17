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
import com.example.fitsforkip.data.model.IncidentHistory;
import com.example.fitsforkip.ui.login.LoginActivity;
import com.google.android.material.card.MaterialCardView;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.android.material.navigation.NavigationView;

import java.util.ArrayList;
import java.util.List;

public class IncidentHistoryActivity extends AppCompatActivity {

    private DrawerLayout drawerLayout;
    private NavigationView navigationView;
    private Toolbar toolbar;
    private RecyclerView rvIncidentHistory;
    private TextView tvIncidentCount;
    private IncidentHistoryAdapter adapter;
    private List<IncidentHistory> incidentList;

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

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_incident_history);

        loadUserData();
        initViews();
        setupToolbarAndDrawer();
        loadIncidentData();
        setupRecyclerView();
        updateIncidentCount();
        updateUserInfo();
        setupNavListeners();
        setupFabListeners();
    }

    private void loadUserData() {
        SharedPreferences prefs = getSharedPreferences("AppPrefs", MODE_PRIVATE);
        employeeId = prefs.getString("employee_id", "Unknown");
        productionLine = prefs.getString("production_line", "Unknown");
    }

    private void initViews() {
        toolbar = findViewById(R.id.toolbar);
        drawerLayout = findViewById(R.id.drawer_layout);
        navigationView = findViewById(R.id.nav_view);
        rvIncidentHistory = findViewById(R.id.rv_incident_history);
        tvIncidentCount = findViewById(R.id.tv_incident_count);

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
        // Dữ liệu mẫu incident history
        incidentList = new ArrayList<>();
        incidentList.add(new IncidentHistory("QR001", "TB001", "Máy hàn tự động hóa, máy kiểm tra, máy chế biến", "Hàn khung xe", "Dây chuyền 2 - Hàn", "Động cơ bị nóng, hỏng, không hoạt động, không ổn định", "2023-10-01 08:00", "2023-10-01 10:00", "2 giờ", "Hỏng hóc", false));
        incidentList.add(new IncidentHistory("QR002", "TB002", "Máy sơn phun", "Sơn bề mặt", "Dây chuyền 3 - Sơn", "Bình sơn hết", "2023-10-02 09:00", "2023-10-02 09:30", "30 phút", "Thiếu vật tư", true));
        incidentList.add(new IncidentHistory("QR003", "TB004", "Máy kiểm tra", "Kiểm tra chất lượng", "Dây chuyền 5 - Kiểm tra", "Cảm biến hỏng", "2023-10-03 14:00", "2023-10-03 16:00", "2 giờ", "Hỏng hóc", true));
    }

    private void setupRecyclerView() {
        adapter = new IncidentHistoryAdapter(incidentList, this::onDeleteIncident);
        rvIncidentHistory.setLayoutManager(new LinearLayoutManager(this));
        rvIncidentHistory.setAdapter(adapter);
    }

    private void updateIncidentCount() {
        tvIncidentCount.setText(String.valueOf(incidentList.size()));
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
                    .setMessage("Bạn có chắc chắn muốn xóa tất cả lịch sử sự cố?")
                    .setPositiveButton("Xóa", (dialog, which) -> {
                        incidentList.clear();
                        adapter.notifyDataSetChanged();
                        updateIncidentCount();
                        Toast.makeText(this, "Đã xóa tất cả", Toast.LENGTH_SHORT).show();
                    })
                    .setNegativeButton("Hủy", null)
                    .show();
        });

        fabSaveTemp.setOnClickListener(v -> {
            Toast.makeText(this, "Đã lưu tạm thời", Toast.LENGTH_SHORT).show();
        });

        fabUpload.setOnClickListener(v -> {
            Toast.makeText(this, "Đang tải lên dữ liệu", Toast.LENGTH_SHORT).show();
        });
    }

    private void onDeleteIncident(int position) {
        new AlertDialog.Builder(this)
                .setTitle("Xóa sự cố")
                .setMessage("Bạn có chắc chắn muốn xóa sự cố này?")
                .setPositiveButton("Xóa", (dialog, which) -> {
                    incidentList.remove(position);
                    adapter.notifyItemRemoved(position);
                    updateIncidentCount();
                    Toast.makeText(this, "Đã xóa sự cố", Toast.LENGTH_SHORT).show();
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



