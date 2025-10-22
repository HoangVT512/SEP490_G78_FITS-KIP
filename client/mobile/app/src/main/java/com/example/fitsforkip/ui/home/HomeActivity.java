package com.example.fitsforkip.ui.home;

import android.app.ProgressDialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.Handler;
import android.view.MenuItem;
import android.view.View;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.ActionBarDrawerToggle;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.core.view.GravityCompat;
import androidx.drawerlayout.widget.DrawerLayout;

import com.example.fitsforkip.R;
import com.example.fitsforkip.data.local.AppDatabase;
import com.example.fitsforkip.data.local.AppDatabaseSingleton;
import com.example.fitsforkip.data.local.IncidentHistoryEntity;
import com.example.fitsforkip.data.model.IncidentRequestWrapper;
import com.example.fitsforkip.ui.equipment.EquipmentListActivity;
import com.example.fitsforkip.ui.incident.IncidentHistoryActivity;
import com.example.fitsforkip.ui.login.LoginActivity;
import com.example.fitsforkip.ui.scan.DeviceInfoDialog;
import com.example.fitsforkip.ui.scan.QRScannerActivity;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.android.material.navigation.NavigationView;
import com.google.android.material.card.MaterialCardView;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import com.example.fitsforkip.data.model.Equipment;
import com.example.fitsforkip.data.remote.ApiClient;
import com.example.fitsforkip.data.remote.ApiService;
import com.example.fitsforkip.data.model.ApiResponse;
import com.example.fitsforkip.data.model.CreateIncidentRequest;
import com.example.fitsforkip.data.model.IncidentHistory;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class HomeActivity extends AppCompatActivity implements NavigationView.OnNavigationItemSelectedListener, DeviceInfoDialog.OnOptionsSelectedListener {

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

    private LinearLayout llDeviceCardsContainer;

    private Map<String, DeviceCard> deviceCards = new HashMap<>();

    private boolean isFabOpen = false;
    private Animation fabOpenRotate, fabCloseRotate, fabOpen, fabClose;

    private String employeeId;
    private String productionLine;

    private String currentDeviceCode;
    private String currentProdLine;
    private String currentCongDoan;

    private Handler timerHandler = new Handler();
    private Runnable timerRunnable;
    private long totalElapsed = 0;
    private long lastStartTime = 0;
    private boolean isTimerRunning = false;

    private ProgressDialog progressDialog;

    private List<Equipment> equipmentList;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_home);

        loadUserData();
        loadEquipmentList();
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

        llDeviceCardsContainer = findViewById(R.id.ll_device_cards_container);

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

            // Find equipment by qrCode
            Equipment equipment = null;
            if (equipmentList != null) {
                for (Equipment eq : equipmentList) {
                    if (eq.getQrcode().equals(qrCode)) {
                        equipment = eq;
                        break;
                    }
                }
            }

            if (equipment == null) {
                Toast.makeText(this, "Không tìm thấy thiết bị với mã QR đã quét", Toast.LENGTH_SHORT).show();
                return;
            }

            currentDeviceCode = qrCode;
            currentProdLine = prodLine;
            currentCongDoan = equipment.getStageName();

            if (deviceCards.containsKey(currentDeviceCode)) {
                // Second scan: directly show confirmation dialog
                showStopConfirmationDialog(currentDeviceCode);
            } else {
                // First scan: show DeviceInfoDialog with equipment
                DeviceInfoDialog dialog = new DeviceInfoDialog(this, equipment, this);
                dialog.show();
            }
        }
    }

    private void showStopConfirmationDialog(String deviceCode) {
        DeviceCard card = deviceCards.get(deviceCode);
        long currentElapsed = card.totalElapsed;
        if (card.isTimerRunning) {
            currentElapsed += System.currentTimeMillis() - card.lastStartTime;
        }
        long totalSeconds = currentElapsed / 1000;
        int hours = (int) (totalSeconds / 3600);
        int minutes = (int) ((totalSeconds % 3600) / 60);
        int seconds = (int) (totalSeconds % 60);
        String currentRunningTime = String.format("%02d:%02d:%02d", hours, minutes, seconds);

        new AlertDialog.Builder(this)
                .setTitle("Xác nhận kết thúc")
                .setMessage("Thiết bị: " + deviceCode + "\nThời gian bắt đầu: " + card.startTime + "\nThời gian chạy hiện tại: " + currentRunningTime + "\nBạn có muốn kết thúc và ghi nhận không?")
                .setPositiveButton("Xác nhận", (dialog, which) -> {
                    // Show loading
                    showLoading("Đang lưu bản ghi...");

                    // Simulate API call with delay
                    new Handler().postDelayed(() -> {
                        // Calculate total time
                        card.stopAndRemove();
                        //reset deviceCards
                        deviceCards.remove(deviceCode);

                        hideLoading();
                        Toast.makeText(HomeActivity.this, "Đã ghi nhận thành công cho thiết bị " + deviceCode, Toast.LENGTH_SHORT).show();
                    }, 2000); // Simulate 2s API call
                })
                .setNegativeButton("Hủy", null)
                .show();
    }

    @Override
    public void onOptionsSelected(List<String> selectedOptions) {
        // Check if selected options include relevant ones (exclude "Báo cáo sự cố")
        boolean hasRelevantOption = false;
        String type = "";
        String problem = "";
        Equipment equipment = null;

        for (String option : selectedOptions) {
            if (option.equals("Phế phẩm")) {
                hasRelevantOption = true;
                type = "Phế phẩm";
                problem = "";
            } else if (option.equals("Đổi mã")) {
                hasRelevantOption = true;
                type = "Đổi mã";
                problem = "";
            } else if (!option.equals("Cần hỗ trợ kỹ thuật") && !option.equals("Báo cáo sự cố")) {
                // XỬ LÝ CÁC OPTIONS KHÁC TỪ EQUIPMENT ISSUES
                hasRelevantOption = true;
                if (type.isEmpty()) {
                    type = "Chưa xác định";
                }
                if (problem.isEmpty()) {
                    problem = option;
                } else {
                    problem += ", " + option;
                }
            } else if (option.equals("Cần hỗ trợ kỹ thuật")) {
                hasRelevantOption = true;
                if (type.isEmpty()) {
                    type = "Cần hỗ trợ kỹ thuật";
                }
                if (problem.isEmpty()) {
                    problem = "Chưa xác định";
                } else {
                    problem += ", Cần hỗ trợ kỹ thuật";
                }
            }
        }

        if (hasRelevantOption) {
            // Find the equipment details
            if (equipmentList != null) {
                for (Equipment eq : equipmentList) {
                    if (eq.getQrcode().equals(currentDeviceCode)) {
                        equipment = eq;
                        break;
                    }
                }
            }

            // NẾU KHÔNG TÌM THẤY EQUIPMENT THÌ THÔNG BÁO LỖI - GIỮ NGUYÊN LOGIC CŨ
            if (equipment == null) {
                Toast.makeText(this, "Không tìm thấy thông tin thiết bị", Toast.LENGTH_SHORT).show();
                return;
            }

            // Check if device is already running
            if (deviceCards.containsKey(currentDeviceCode)) {
                // Second scan: confirm to stop and remove
                DeviceCard card = deviceCards.get(currentDeviceCode);
                long currentElapsed = card.totalElapsed;
                if (card.isTimerRunning) {
                    currentElapsed += System.currentTimeMillis() - card.lastStartTime;
                }
                long totalSeconds = currentElapsed / 1000;
                int hours = (int) (totalSeconds / 3600);
                int minutes = (int) ((totalSeconds % 3600) / 60);
                int seconds = (int) (totalSeconds % 60);
                String currentRunningTime = String.format("%02d:%02d:%02d", hours, minutes, seconds);

                new AlertDialog.Builder(this)
                        .setTitle("Xác nhận kết thúc")
                        .setMessage("Thiết bị: " + currentDeviceCode + "\nThời gian bắt đầu: " + card.startTime + "\nThời gian chạy hiện tại: " + currentRunningTime + "\nBạn có muốn kết thúc và ghi nhận không?")
                        .setPositiveButton("Xác nhận", (dialog, which) -> {
                            // Show loading
                            showLoading("Đang lưu bản ghi...");

                            // Simulate API call with delay
                            new Handler().postDelayed(() -> {
                                // Calculate total time
                                card.stopAndRemove();
                                hideLoading();
                                //Toast.makeText(HomeActivity.this, "Đã ghi nhận thành công cho thiết bị " + currentDeviceCode, Toast.LENGTH_SHORT).show();
                            }, 2000); // Simulate 2s API call
                        })
                        .setNegativeButton("Hủy", null)
                        .show();
            } else {
                // First scan: create new card VÀ HIỂN THỊ LÊN MÀN HÌNH - CODE MỚI THÊM
                String startTimeStr = new SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(new Date());
                DeviceCard newCard = new DeviceCard(
                        equipment.getEquipmentCode(),
                        equipment.getEquipmentName(),
                        startTimeStr,
                        type,
                        problem,
                        selectedOptions, // Gửi selectedOptions vào đây
                        equipment.getEquipmentId() // Lưu equipmentId trực tiếp
                );
                deviceCards.put(currentDeviceCode, newCard);

                //Toast.makeText(this, "Đã bắt đầu ghi nhận thiết bị " + currentDeviceCode, Toast.LENGTH_SHORT).show();
            }
        }
    }

    private void startTimer() {
        lastStartTime = System.currentTimeMillis();
        isTimerRunning = true;
        //btnToggleTimer.setImageResource(android.R.drawable.ic_media_pause);

        timerRunnable = new Runnable() {
            @Override
            public void run() {
                if (isTimerRunning) {
                    totalElapsed += System.currentTimeMillis() - lastStartTime;
                    lastStartTime = System.currentTimeMillis();

                    long elapsed = totalElapsed;
                    int seconds = (int) (elapsed / 1000) % 60;
                    int minutes = (int) ((elapsed / (1000 * 60)) % 60);
                    int hours = (int) ((elapsed / (1000 * 60 * 60)) % 24);
                    //tvRunningTime.setText(String.format("Thời gian chạy: %02d:%02d:%02d", hours, minutes, seconds));
                    timerHandler.postDelayed(this, 1000);
                }
            }
        };
        timerHandler.post(timerRunnable);
    }

    private void toggleTimer() {
        if (isTimerRunning) {
            // Pause timer
            totalElapsed += System.currentTimeMillis() - lastStartTime;
            isTimerRunning = false;
            //btnToggleTimer.setImageResource(android.R.drawable.ic_media_play);
            timerHandler.removeCallbacks(timerRunnable);
        } else {
            // Resume timer
            lastStartTime = System.currentTimeMillis();
            isTimerRunning = true;
            //btnToggleTimer.setImageResource(android.R.drawable.ic_media_pause);
            timerHandler.post(timerRunnable);
        }
    }

    private void showLoading(String message) {
        if (progressDialog == null) {
            progressDialog = new ProgressDialog(this);
            progressDialog.setCancelable(false);
        }
        progressDialog.setMessage(message);
        progressDialog.show();
    }

    private void hideLoading() {
        if (progressDialog != null && progressDialog.isShowing()) {
            progressDialog.dismiss();
        }
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
                    // Optionally, show a toast or log
                    //Toast.makeText(HomeActivity.this, "Đã tải danh sách thiết bị", Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(HomeActivity.this, "Không thể tải danh sách thiết bị", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Equipment>>> call, Throwable t) {
                Toast.makeText(HomeActivity.this, "Lỗi: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private class DeviceCard {
        String deviceCode;
        String deviceName;
        String startTime;
        String type;
        String problem;
        List<String> selectedOptions;
        long totalElapsed;
        long lastStartTime;
        boolean isTimerRunning;
        Handler timerHandler;
        Runnable timerRunnable;
        View cardView;
        TextView tvRunningTime;
        ImageButton btnToggleTimer;
        int equipmentId; // Thêm trường equipmentId

        DeviceCard(String deviceCode, String deviceName, String startTime, String type, String problem, List<String> selectedOptions, int equipmentId) {
            this.deviceCode = deviceCode;
            this.deviceName = deviceName;
            this.startTime = startTime;
            this.type = type;
            this.problem = problem;
            this.selectedOptions = selectedOptions;
            this.equipmentId = equipmentId;
            this.totalElapsed = 0;
            this.lastStartTime = 0;
            this.isTimerRunning = false;
            this.timerHandler = new Handler();

            // Inflate the card view
            cardView = getLayoutInflater().inflate(R.layout.item_device_card, llDeviceCardsContainer, false);
            llDeviceCardsContainer.addView(cardView);

            // Initialize views
            TextView tvDeviceCode = cardView.findViewById(R.id.tv_device_code);
            TextView tvDeviceName = cardView.findViewById(R.id.tv_device_name);
            TextView tvStartTime = cardView.findViewById(R.id.tv_start_time);
            TextView tvType = cardView.findViewById(R.id.tv_type);
            TextView tvProblem = cardView.findViewById(R.id.tv_problem);
            tvRunningTime = cardView.findViewById(R.id.tv_running_time);
            btnToggleTimer = cardView.findViewById(R.id.btn_toggle_timer);

            // Populate fields
            tvDeviceCode.setText("Mã TB: " + deviceCode);
            tvDeviceName.setText("Tên TB: " + deviceName);
            tvStartTime.setText("TG BD: " + startTime);
            tvType.setText("Loại: " + type);
            if (!problem.isEmpty()) {
                tvProblem.setText("Vấn đề: " + problem);
                tvProblem.setVisibility(View.VISIBLE);
            } else {
                tvProblem.setVisibility(View.GONE);
            }

            // Start timer
            startTimer();

            // Set up toggle button listener
            btnToggleTimer.setOnClickListener(v -> toggleTimer());
        }

        void startTimer() {
            lastStartTime = System.currentTimeMillis();
            isTimerRunning = true;
            btnToggleTimer.setImageResource(android.R.drawable.ic_media_pause);

            timerRunnable = new Runnable() {
                @Override
                public void run() {
                    if (isTimerRunning) {
                        totalElapsed += System.currentTimeMillis() - lastStartTime;
                        lastStartTime = System.currentTimeMillis();

                        long elapsed = totalElapsed;
                        int seconds = (int) (elapsed / 1000) % 60;
                        int minutes = (int) ((elapsed / (1000 * 60)) % 60);
                        int hours = (int) ((elapsed / (1000 * 60 * 60)) % 24);
                        tvRunningTime.setText(String.format("Thời gian chạy: %02d:%02d:%02d", hours, minutes, seconds));
                        timerHandler.postDelayed(this, 1000);
                    }
                }
            };
            timerHandler.post(timerRunnable);
        }

        void toggleTimer() {
            if (isTimerRunning) {
                // Pause timer
                totalElapsed += System.currentTimeMillis() - lastStartTime;
                isTimerRunning = false;
                btnToggleTimer.setImageResource(android.R.drawable.ic_media_play);
                timerHandler.removeCallbacks(timerRunnable);
            } else {
                // Resume timer
                lastStartTime = System.currentTimeMillis();
                isTimerRunning = true;
                btnToggleTimer.setImageResource(android.R.drawable.ic_media_pause);
                timerHandler.post(timerRunnable);
            }
        }

        void stopAndRemove() {
            // Stop timer
            if (isTimerRunning) {
                totalElapsed += System.currentTimeMillis() - lastStartTime;
                timerHandler.removeCallbacks(timerRunnable);
            }

            // Calculate total time
            long totalSeconds = totalElapsed / 1000;
            int hours = (int) (totalSeconds / 3600);
            int minutes = (int) ((totalSeconds % 3600) / 60);
            int seconds = (int) (totalSeconds % 60);
            String totalTime = String.format("%02d:%02d:%02d", hours, minutes, seconds);

            // Calculate duration in minutes
            double durationMinutes = totalElapsed / (1000.0 * 60.0);

            // Determine typeId
            int typeId; // default dung ngan
            boolean isTechSupport;
            if (selectedOptions.contains("Phế phẩm")) {
                isTechSupport = false;
                typeId = 3;
            } else if (selectedOptions.contains("Đổi mã")) {
                isTechSupport = false;
                typeId = 4;
            } else {
                if (durationMinutes > 5) {
                    typeId = 2; // dung dai
                } else {
                    typeId = 1;
                }
                if (selectedOptions.contains("Cần hỗ trợ kỹ thuật")) {
                    isTechSupport = true;
                } else {
                    isTechSupport = false;
                }
            }

            // Status: Hoàn thành since endTime is set
            String status = "Hoàn thành";

            // Use the stored equipmentId instead of searching again
            int equipmentId = this.equipmentId;

            // Create entity
            Date startDate = new Date(); // Need to parse startTime, but for simplicity, use current - totalElapsed
            Date endDate = new Date();
            startDate.setTime(endDate.getTime() - totalElapsed);

            IncidentHistoryEntity entity = new IncidentHistoryEntity(
                equipmentId,
                startDate,
                endDate,
                durationMinutes,
                typeId,
                "", // reason
                "", // solution
                problem,
                status,
                new Date(), // createdDate
                employeeId, // reportedByUserId
                "", // assignedTo
                isTechSupport,
                false // synced
            );

            // Insert to DB
            int finalEquipmentId = equipmentId;
            new Thread(() -> {
                AppDatabase db = AppDatabaseSingleton.getInstance(HomeActivity.this);
                long id = db.incidentHistoryDao().insert(entity);
                // SET incidentId cho entity sau khi insert
                entity.setIncidentId((int)id);

                // Log
                android.util.Log.d("Sự cố đã được thêm vào lịch sử", "Đã thêm sự cố: ID=" + id + ", EquipmentId=" + finalEquipmentId + ", Duration=" + durationMinutes + ", TypeId=" + typeId + ", Status=" + status + ", IsTechSupport=" + isTechSupport + ", Synced=" + false);

                // Now upload to server
                uploadIncidentToServer(entity, id);
                // Log when upload to server is done
                android.util.Log.d("Upload sự cố", "Đã upload sự cố với ID cục bộ=" + id);
            }).start();

            // Log or save the total time (placeholder)
            Toast.makeText(HomeActivity.this, "Thiết bị " + deviceCode + " tổng thời gian: " + totalTime, Toast.LENGTH_SHORT).show();

            // Remove from container and map
            llDeviceCardsContainer.removeView(cardView);
            deviceCards.remove(deviceCode);
        }

        private void uploadIncidentToServer(IncidentHistoryEntity entity, long localId) {
            SharedPreferences prefs = getSharedPreferences("AppPrefs", MODE_PRIVATE);
            String token = prefs.getString("token", null);

            if (token == null) {
                android.util.Log.e("Upload sự cố", "Không tìm thấy token xác thực");
                return;
            }

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

            ApiService apiService = ApiClient.getClient().create(ApiService.class);
            Call<ApiResponse<IncidentHistory>> call = apiService.createIncident("Bearer " + token, request);
            call.enqueue(new Callback<ApiResponse<IncidentHistory>>() {
                @Override
                public void onResponse(Call<ApiResponse<IncidentHistory>> call, Response<ApiResponse<IncidentHistory>> response) {
                    if (response.isSuccessful()) {
                        // QUAN TRỌNG: Cập nhật synced bằng incidentId
                        new Thread(() -> {
                            AppDatabase db = AppDatabaseSingleton.getInstance(HomeActivity.this);
                            // SỬ DỤNG localId thay vì entity.incidentId
                            db.incidentHistoryDao().updateSyncedStatus((int)localId, true);
                            android.util.Log.d("Upload sự cố", "Tải lên thành công, cập nhật đồng bộ cho ID=" + localId);
                        }).start();
                    } else {
                        android.util.Log.e("Upload sự cố", "Upload lỗi: " + response.message());
                    }
                }

                @Override
                public void onFailure(Call<ApiResponse<IncidentHistory>> call, Throwable t) {
                    android.util.Log.e("Upload sự cố", "Upload lỗi: " + t.getMessage(), t);
                }
            });
        }

        private String formatDate(Date date) {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault());
            return sdf.format(date);
        }
    }
}
