package com.example.fitsforkip.ui.home;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.MenuItem;
import android.view.View;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.ActionBarDrawerToggle;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.core.view.GravityCompat;
import androidx.drawerlayout.widget.DrawerLayout;

import com.example.fitsforkip.R;
import com.example.fitsforkip.ui.equipment.EquipmentListActivity;
import com.example.fitsforkip.ui.incident.IncidentHistoryActivity;
import com.example.fitsforkip.ui.login.LoginActivity;
import com.example.fitsforkip.ui.scan.DeviceInfoDialog;
import com.example.fitsforkip.ui.scan.QRScannerActivity;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.android.material.navigation.NavigationView;
import com.google.android.material.card.MaterialCardView;

public class HomeActivity extends AppCompatActivity implements NavigationView.OnNavigationItemSelectedListener {

    private DrawerLayout drawerLayout;
    private NavigationView navigationView;
    private Toolbar toolbar;

    private FloatingActionButton fabMain;
    private FloatingActionButton fabEquipment;
    private FloatingActionButton fabHistory;
    private FloatingActionButton btnScan;
    private View fabOverlay;

    private MaterialCardView cvScanQR;
    private MaterialCardView cvStatistics;
    private MaterialCardView cvQuickAccess;
    private MaterialCardView cvEquipment;
    private MaterialCardView cvHistory;

    private MaterialCardView cvNavHome;
    private MaterialCardView cvNavEquipment;
    private MaterialCardView cvNavHistory;
    private MaterialCardView cvNavLogout;

    private TextView tvHeaderEmployeeId;
    private TextView tvHeaderProductionLine;

    private boolean isFabOpen = false;
    private Animation fabOpenRotate, fabCloseRotate, fabOpen, fabClose;

    private String employeeId;
    private String productionLine;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_home);

        loadUserData();
        initViews();
        setupToolbarAndDrawer();
        setupAnimations();
        //setupListeners();
        updateUserInfo();
    }

    private void loadUserData() {
        SharedPreferences prefs = getSharedPreferences("AppPrefs", MODE_PRIVATE);
        employeeId = prefs.getString("employee_id", "Unknown");
        productionLine = prefs.getString("production_line", "Unknown");

        // Hoặc lấy từ Intent
        Intent intent = getIntent();
        if (intent.hasExtra("employee_id")) {
            employeeId = intent.getStringExtra("employee_id");
            productionLine = intent.getStringExtra("production_line");
        }
    }

    private void initViews() {
        toolbar = findViewById(R.id.toolbar);
        drawerLayout = findViewById(R.id.drawer_layout);
        navigationView = findViewById(R.id.nav_view);

        // Navigation header
        View headerView = navigationView.getHeaderView(0);
        tvHeaderEmployeeId = headerView.findViewById(R.id.tv_header_employee_id);
        tvHeaderProductionLine = headerView.findViewById(R.id.tv_header_production_line);

        // Navigation cards
        cvNavHome = headerView.findViewById(R.id.cv_nav_home);
        cvNavEquipment = headerView.findViewById(R.id.cv_nav_equipment);
        cvNavHistory = headerView.findViewById(R.id.cv_nav_history);
        cvNavLogout = headerView.findViewById(R.id.cv_nav_logout);

        // Initialize btnScan
        btnScan = findViewById(R.id.btnScan);

        setupNavListeners();
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

        navigationView.setNavigationItemSelectedListener(this);
    }

    private void setupAnimations() {
        fabOpenRotate = AnimationUtils.loadAnimation(this, R.anim.fab_rotate_open);
        fabCloseRotate = AnimationUtils.loadAnimation(this, R.anim.fab_rotate_close);
        fabOpen = AnimationUtils.loadAnimation(this, R.anim.fab_open);
        fabClose = AnimationUtils.loadAnimation(this, R.anim.fab_close);
    }

    private void updateUserInfo() {
        tvHeaderEmployeeId.setText("Mã NV: " + employeeId);
        tvHeaderProductionLine.setText(productionLine);
    }

    private void setupNavListeners() {
        cvNavHome.setOnClickListener(v -> {
            drawerLayout.closeDrawer(GravityCompat.START);
        });

        cvNavEquipment.setOnClickListener(v -> {
            Intent intent = new Intent(HomeActivity.this, EquipmentListActivity.class);
            startActivity(intent);
            drawerLayout.closeDrawer(GravityCompat.START);
        });

        cvNavHistory.setOnClickListener(v -> {
            Intent intent = new Intent(HomeActivity.this, IncidentHistoryActivity.class);
            startActivity(intent);
            drawerLayout.closeDrawer(GravityCompat.START);
        });

        cvNavLogout.setOnClickListener(v -> {
            showLogoutDialog();
        });

        // Thêm listener cho nút quét QR
        btnScan.setOnClickListener(v -> {
            Intent intent = new Intent(HomeActivity.this, QRScannerActivity.class);
            intent.putExtra("production_line", productionLine);
            startActivityForResult(intent, 1);
        });
    }

    @Override
    public boolean onNavigationItemSelected(MenuItem item) {
        int id = item.getItemId();

        if (id == R.id.nav_home) {
            // Already on home
        } else if (id == R.id.nav_equipment) {
        } else if (id == R.id.nav_history) {
        } else if (id == R.id.nav_logout) {
            showLogoutDialog();
        }

        drawerLayout.closeDrawer(GravityCompat.START);
        return true;
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
//        } else if (isFabOpen) {
//            animateFAB();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == 1 && resultCode == RESULT_OK) {
            String qrCode = data.getStringExtra("qr_code");
            String prodLine = data.getStringExtra("production_line");
            // Assume congDoan is fetched or hardcoded
            String congDoan = "Công đoạn 1"; // Placeholder, replace with actual logic

            DeviceInfoDialog dialog = new DeviceInfoDialog(this, qrCode, prodLine, congDoan);
            dialog.show();
        }
    }
}
