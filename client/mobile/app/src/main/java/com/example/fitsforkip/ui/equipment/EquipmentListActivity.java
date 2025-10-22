package com.example.fitsforkip.ui.equipment;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
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
import com.example.fitsforkip.data.model.Equipment;
import com.example.fitsforkip.ui.home.HomeActivity;
import com.example.fitsforkip.ui.incident.IncidentHistoryActivity;
import com.example.fitsforkip.ui.login.LoginActivity;
import com.google.android.material.card.MaterialCardView;
import com.google.android.material.navigation.NavigationView;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import com.example.fitsforkip.data.remote.ApiClient;
import com.example.fitsforkip.data.remote.ApiService;
import com.example.fitsforkip.data.model.ApiResponse;

public class EquipmentListActivity extends AppCompatActivity {

    private DrawerLayout drawerLayout;
    private NavigationView navigationView;
    private Toolbar toolbar;
    private RecyclerView rvEquipment;
    private TextView tvEquipmentCount;
    private EquipmentAdapter adapter;
    private List<Equipment> equipmentList;

    private MaterialCardView cvNavHome;
    private MaterialCardView cvNavEquipment;
    private MaterialCardView cvNavHistory;
    private MaterialCardView cvNavLogout;

    private TextView tvHeaderEmployeeId;
    private TextView tvHeaderProductionLine;

    private String employeeId;
    private String productionLine;

    private int lineId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_equipment_list);

        loadUserData();
        initViews();
        setupToolbarAndDrawer();
        loadEquipmentData();
        setupRecyclerView();
        updateEquipmentCount();
        updateUserInfo();
        setupNavListeners();
    }

    private void loadUserData() {
        SharedPreferences prefs = getSharedPreferences("AppPrefs", MODE_PRIVATE);
        employeeId = prefs.getString("employee_id", "Unknown");
        productionLine = prefs.getString("production_line", "Unknown");
        lineId = prefs.getInt("line_id", -1);
    }

    private void initViews() {
        toolbar = findViewById(R.id.toolbar);
        drawerLayout = findViewById(R.id.drawer_layout);
        navigationView = findViewById(R.id.nav_view);
        rvEquipment = findViewById(R.id.rv_equipment);
        tvEquipmentCount = findViewById(R.id.tv_equipment_count);

        // Initialize equipment list
        equipmentList = new ArrayList<>();

        // Navigation header
        View headerView = navigationView.getHeaderView(0);
        tvHeaderEmployeeId = headerView.findViewById(R.id.tv_header_employee_id);
        tvHeaderProductionLine = headerView.findViewById(R.id.tv_header_production_line);

        // Navigation cards
        cvNavHome = headerView.findViewById(R.id.cv_nav_home);
        cvNavEquipment = headerView.findViewById(R.id.cv_nav_equipment);
        cvNavHistory = headerView.findViewById(R.id.cv_nav_history);
        cvNavLogout = headerView.findViewById(R.id.cv_nav_logout);
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

    private void loadEquipmentData() {
        if (lineId == -1) {
            Toast.makeText(this, "Không tìm thấy thông tin dây chuyền", Toast.LENGTH_SHORT).show();
            return;
        }

        SharedPreferences prefs = getSharedPreferences("AppPrefs", MODE_PRIVATE);
        String token = prefs.getString("token", null);
        if (token == null) {
            Toast.makeText(this, "Không tìm thấy token xác thực", Toast.LENGTH_SHORT).show();
            return;
        }

        // Fetch equipment from API
        ApiService apiService = ApiClient.getClient().create(ApiService.class);
        Call<ApiResponse<List<Equipment>>> call = apiService.getEquipmentsByLine("Bearer " + token, lineId);
        call.enqueue(new Callback<ApiResponse<List<Equipment>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Equipment>>> call, Response<ApiResponse<List<Equipment>>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    equipmentList = response.body().getData();
                    adapter.setData(equipmentList);
                    updateEquipmentCount();
                } else {
                    Toast.makeText(EquipmentListActivity.this, "Không thể tải danh sách thiết bị", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Equipment>>> call, Throwable t) {
                Toast.makeText(EquipmentListActivity.this, "Lỗi: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void setupRecyclerView() {
        adapter = new EquipmentAdapter(equipmentList);
        rvEquipment.setLayoutManager(new LinearLayoutManager(this));
        rvEquipment.setAdapter(adapter);
    }

    private void updateEquipmentCount() {
        tvEquipmentCount.setText(String.valueOf(equipmentList.size()));
    }

    private void updateUserInfo() {
        tvHeaderEmployeeId.setText("Mã NV: " + employeeId);
        tvHeaderProductionLine.setText(productionLine);
    }

    private void setupNavListeners() {
        cvNavHome.setOnClickListener(v -> {
            Intent intent = new Intent(EquipmentListActivity.this, HomeActivity.class);
            startActivity(intent);
            drawerLayout.closeDrawer(GravityCompat.START);
        });

        cvNavEquipment.setOnClickListener(v -> {
            // Đang ở trang Equipment
            drawerLayout.closeDrawer(GravityCompat.START);
        });

        cvNavHistory.setOnClickListener(v -> {
            Intent intent = new Intent(EquipmentListActivity.this, IncidentHistoryActivity.class);
            startActivity(intent);
            drawerLayout.closeDrawer(GravityCompat.START);
        });

        cvNavLogout.setOnClickListener(v -> {
            showLogoutDialog();
        });
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