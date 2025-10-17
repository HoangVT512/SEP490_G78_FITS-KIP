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
    }

    private void initViews() {
        toolbar = findViewById(R.id.toolbar);
        drawerLayout = findViewById(R.id.drawer_layout);
        navigationView = findViewById(R.id.nav_view);
        rvEquipment = findViewById(R.id.rv_equipment);
        tvEquipmentCount = findViewById(R.id.tv_equipment_count);

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
        // Dữ liệu mẫu thiết bị
        equipmentList = new ArrayList<>();
        equipmentList.add(new Equipment("TB001", "Máy hàn tự động", "Hàn khung xe", "Dây chuyền 2 - Hàn",
                Arrays.asList("Động cơ bị nóng", "Tiếng ồn lớn")));
        equipmentList.add(new Equipment("TB002", "Máy sơn phun", "Sơn bề mặt", "Dây chuyền 3 - Sơn",
                Arrays.asList("Bình sơn hết")));
        equipmentList.add(new Equipment("TB003", "Máy lắp ráp", "Lắp ráp linh kiện", "Dây chuyền 1 - Lắp ráp",
                Arrays.asList()));
        equipmentList.add(new Equipment("TB004", "Máy kiểm tra", "Kiểm tra chất lượng", "Dây chuyền 5 - Kiểm tra",
                Arrays.asList("Cảm biến hỏng", "Màn hình không sáng")));
        equipmentList.add(new Equipment("TB005", "Máy đóng gói", "Đóng gói sản phẩm", "Dây chuyền 4 - Đóng gói",
                Arrays.asList("Băng dính hết")));
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