package com.example.fitsforkip.ui.home;

import android.Manifest;
import android.app.ProgressDialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.provider.MediaStore;
import android.util.Log;
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
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import androidx.core.view.GravityCompat;
import androidx.drawerlayout.widget.DrawerLayout;

import com.example.fitsforkip.R;
import com.example.fitsforkip.data.local.AppDatabase;
import com.example.fitsforkip.data.local.AppDatabaseSingleton;
import com.example.fitsforkip.data.local.IncidentHistoryEntity;
import com.example.fitsforkip.data.model.BulkIncidentResponse;
import com.example.fitsforkip.data.model.CreateBulkIncidentRequest;
import com.example.fitsforkip.data.model.IncidentRequestWrapper;
import com.example.fitsforkip.data.model.UploadImageResponse;
import com.example.fitsforkip.ui.equipment.EquipmentListActivity;
import com.example.fitsforkip.ui.incident.IncidentHistoryActivity;
import com.example.fitsforkip.ui.login.LoginActivity;
import com.example.fitsforkip.ui.scan.AddTechnicalSupportImagesDialog;
import com.example.fitsforkip.ui.scan.DeviceInfoDialog;
import com.example.fitsforkip.ui.scan.QRScannerActivity;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.android.material.navigation.NavigationView;
import com.google.android.material.card.MaterialCardView;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Arrays;

import com.example.fitsforkip.data.model.Equipment;
import com.example.fitsforkip.data.remote.ApiClient;
import com.example.fitsforkip.data.remote.ApiService;
import com.example.fitsforkip.data.model.ApiResponse;
import com.example.fitsforkip.data.model.CreateIncidentRequest;
import com.example.fitsforkip.data.model.IncidentHistory;

import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class HomeActivity extends AppCompatActivity implements NavigationView.OnNavigationItemSelectedListener, DeviceInfoDialog.OnOptionsSelectedListener, AddTechnicalSupportImagesDialog.OnImageCaptureRequested {

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
    private String userId;
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

    private AddTechnicalSupportImagesDialog currentImageDialog;
    private Uri currentPhotoUri;

    private int lineId;

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
        userId = prefs.getString("user_id", null);
        productionLine = prefs.getString("production_line", "Unknown");
        lineId = prefs.getInt("line_id", -1);

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
        } else if (requestCode == AddTechnicalSupportImagesDialog.REQUEST_CAMERA) {
            // XỬ LÝ KẾT QUẢ TỪ CAMERA
            if (resultCode == RESULT_OK && currentImageDialog != null) {
                // Tạo Intent với URI đã lưu
                Intent cameraData = new Intent();
                cameraData.setData(currentPhotoUri);
                currentImageDialog.onActivityResult(requestCode, resultCode, cameraData);
            }
        } else if (requestCode == AddTechnicalSupportImagesDialog.REQUEST_GALLERY) {
            // XỬ LÝ KẾT QUẢ TỪ GALLERY
            if (currentImageDialog != null) {
                currentImageDialog.onActivityResult(requestCode, resultCode, data);
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

//    @Override
//    public void onOptionsSelected(List<String> selectedOptions) {
//        boolean hasRelevantOption = false;
//        String type = "";
//        String problem = "";
//        Equipment equipment = null;
//
//        for (String option : selectedOptions) {
//            if (option.equals("Phế phẩm")) {
//                hasRelevantOption = true;
//                type = "Phế phẩm";
//                problem = "";
//            } else if (option.equals("Đổi mã")) {
//                hasRelevantOption = true;
//                type = "Đổi mã";
//                problem = "";
//            } else if (!option.equals("Cần hỗ trợ kỹ thuật") && !option.equals("Báo cáo sự cố")) {
//                hasRelevantOption = true;
//                if (type.isEmpty()) {
//                    type = "Chưa xác định";
//                }
//                if (problem.isEmpty()) {
//                    problem = option;
//                } else {
//                    problem += ", " + option;
//                }
//            } else if (option.equals("Cần hỗ trợ kỹ thuật")) {
//                hasRelevantOption = true;
//                if (type.isEmpty()) {
//                    type = "Cần hỗ trợ kỹ thuật";
//                }
//                if (problem.isEmpty()) {
//                    problem = "Chưa xác định";
//                } else {
//                    problem += ", Cần hỗ trợ kỹ thuật";
//                }
//            }
//        }
//
//        if (hasRelevantOption) {
//            if (equipmentList != null) {
//                for (Equipment eq : equipmentList) {
//                    if (eq.getQrcode().equals(currentDeviceCode)) {
//                        equipment = eq;
//                        break;
//                    }
//                }
//            }
//
//            if (equipment == null) {
//                Toast.makeText(this, "Không tìm thấy thông tin thiết bị", Toast.LENGTH_SHORT).show();
//                return;
//            }
//
//            final Equipment finalEquipment = equipment;
//            final String finalType = type;
//            final String finalProblem = problem;
//            final List<String> finalSelectedOptions = selectedOptions;
//
//            if (selectedOptions.contains("Cần hỗ trợ kỹ thuật")) {
//                // ĐỔI: imagePaths thay vì imageUrls
//                AddTechnicalSupportImagesDialog dialog = new AddTechnicalSupportImagesDialog(this, imagePaths -> {
//                    // Lưu paths local, chưa upload
//                    createIncidentForEquipment(finalEquipment, finalType, finalProblem, finalSelectedOptions, imagePaths);
//                });
//
//                dialog.setImageCaptureRequestedListener(this);
//                currentImageDialog = dialog;
//                dialog.show();
//            } else {
//                createIncidentForEquipment(finalEquipment, finalType, finalProblem, finalSelectedOptions, new ArrayList<>());
//            }
//        }
//    }

    @Override
    public void onOptionsSelected(List<String> selectedOptions) {
        if (selectedOptions.contains("Cần hỗ trợ kỹ thuật")) {
            // Xử lý riêng cho "Cần hỗ trợ kỹ thuật"
            handleTechnicalSupport(selectedOptions);
        } else if (selectedOptions.contains("Vệ sinh đầu/cuối ca") || selectedOptions.contains("Đổi mã")) {
            // Xử lý riêng cho "Vệ sinh đầu/cuối ca" và "Đổi mã" - không có equipmentId
            handleSpecialIncidents(selectedOptions);
        } else {
            // Xử lý các loại khác (giữ nguyên logic cũ)
            handleOtherIncidents(selectedOptions);
        }
    }

    private void handleTechnicalSupport(List<String> selectedOptions) {
        Equipment equipment = findEquipmentByQrCode();
        if (equipment == null) {
            Toast.makeText(this, "Không tìm thấy thiết bị", Toast.LENGTH_SHORT).show();
            return;
        }

        // Hiển thị dialog chọn ảnh
        AddTechnicalSupportImagesDialog dialog = new AddTechnicalSupportImagesDialog(this, imagePaths -> {
            // Gọi upload ngay, không tạo card
            createAndUploadTechnicalSupportIncident(equipment, selectedOptions, imagePaths);
        });
        dialog.setImageCaptureRequestedListener(this);
        currentImageDialog = dialog;
        dialog.show();
    }

    private void createAndUploadTechnicalSupportIncident(Equipment equipment, List<String> selectedOptions, List<String> imagePaths) {
        showLoading("Đang gửi yêu cầu hỗ trợ kỹ thuật...");

        // Tạo entity
        Date startTime = new Date();
        double durationMinutes = 0; // chưa có endtime
        int typeId = 2; // Dừng dài 2
        boolean isTechSupport = true;

        String problem = "";
        for (String opt : selectedOptions) {
            if (!opt.equals("Cần hỗ trợ kỹ thuật")) {
                if (!problem.isEmpty()) problem += ", ";
                problem += opt;
            }
        }

        IncidentHistoryEntity entity = new IncidentHistoryEntity(
                equipment.getEquipmentId(),
                startTime,
                null, // endTime = null
                durationMinutes,
                typeId,
                "",
                "",
                problem,
                "Đang chờ hỗ trợ",
                new Date(),
                userId,
                "",
                isTechSupport,
                false,
                imagePaths,
                new ArrayList<>(),
                lineId
        );

        // Upload ảnh + incident
        new Thread(() -> {
            List<String> uploadedUrls = new ArrayList<>();
            for (String path : imagePaths) {
                String url = uploadImageSync(path);
                if (url != null) uploadedUrls.add(url);
            }
            entity.setImageUrls(uploadedUrls);

            // Lưu DB
            AppDatabase db = AppDatabaseSingleton.getInstance(this);
            long id = db.incidentHistoryDao().insert(entity);

            runOnUiThread(() -> {
                hideLoading();
                Toast.makeText(this, "Đã gửi yêu cầu hỗ trợ kỹ thuật!", Toast.LENGTH_LONG).show();
            });

            // Upload server
            uploadIncidentToServer(entity, id);
        }).start();
    }


    private void handleSpecialIncidents(List<String> selectedOptions) {
        // Xử lý riêng cho "Vệ sinh đầu/cuối ca" và "Đổi mã" - không có equipmentId
        String type = "", problem = "";
        for (String opt : selectedOptions) {
            if (opt.equals("Phế phẩm")) { type = "Phế phẩm"; }
            else if (opt.equals("Đổi mã")) { type = "Đổi mã"; }
            else if (opt.equals("Vệ sinh đầu/cuối ca")) { type = "Vệ sinh đầu/cuối ca"; }
            else if (!opt.equals("Cần hỗ trợ kỹ thuật")) {
                if (!problem.isEmpty()) problem += ", ";
                problem += opt;
            }
        }

        if (type.isEmpty()) type = "Chưa xác định";

        final String finalType = type, finalProblem = problem;

        if (deviceCards.containsKey(currentDeviceCode)) {
            showStopConfirmationDialog(currentDeviceCode);
        } else {
//            String startTimeStr = new SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(new Date());
//            DeviceCard card = new DeviceCard(
//                    "", // Không có mã thiết bị
//                    "", // Không có tên thiết bị
//                    startTimeStr,
//                    finalType,
//                    finalProblem,
//                    selectedOptions,
//                    null, // equipmentId = null
//                    new ArrayList<>()
//            );
//            deviceCards.put(currentDeviceCode, card);
            String startTimeStr = new SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(new Date());
            DeviceCard card = new DeviceCard(
                    "", "", startTimeStr, finalType, finalProblem, selectedOptions, null, new ArrayList<>(), productionLine
            );
            deviceCards.put(currentDeviceCode, card);
        }
    }

    private void handleOtherIncidents(List<String> selectedOptions) {
        Equipment equipment = findEquipmentByQrCode();
        if (equipment == null) {
            Toast.makeText(this, "Không tìm thấy thiết bị", Toast.LENGTH_SHORT).show();
            return;
        }

        String type = "", problem = "";
        for (String opt : selectedOptions) {
            if (opt.equals("Phế phẩm")) { type = "Phế phẩm"; }
            else if (opt.equals("Đổi mã")) { type = "Đổi mã"; }
            else if (!opt.equals("Cần hỗ trợ kỹ thuật")) {
                if (!problem.isEmpty()) problem += ", ";
                problem += opt;
            }
        }

        if (type.isEmpty()) type = "Chưa xác định";

        final String finalType = type, finalProblem = problem;

        if (deviceCards.containsKey(currentDeviceCode)) {
            showStopConfirmationDialog(currentDeviceCode);
        } else {
            String startTimeStr = new SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(new Date());
            DeviceCard card = new DeviceCard(
                    equipment.getEquipmentCode(),
                    equipment.getEquipmentName(),
                    startTimeStr,
                    finalType,
                    finalProblem,
                    selectedOptions,
                    equipment.getEquipmentId(),
                    new ArrayList<>()
            );
            deviceCards.put(currentDeviceCode, card);
        }
    }

    private Equipment findEquipmentByQrCode() {
        if (equipmentList == null) return null;
        for (Equipment eq : equipmentList) {
            if (eq.getQrcode().equals(currentDeviceCode)) {
                return eq;
            }
        }
        return null;
    }

    // ĐỔI: Tham số từ imageUrls → imagePaths
    private void createIncidentForEquipment(Equipment equipment, String type, String problem, List<String> selectedOptions, List<String> imagePaths) {
        if (deviceCards.containsKey(currentDeviceCode)) {
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
                        showLoading("Đang lưu bản ghi...");
                        new Handler().postDelayed(() -> {
                            card.stopAndRemove();
                            deviceCards.remove(currentDeviceCode);
                            hideLoading();
                            Toast.makeText(HomeActivity.this, "Đã ghi nhận thành công cho thiết bị " + currentDeviceCode, Toast.LENGTH_SHORT).show();
                        }, 2000);
                    })
                    .setNegativeButton("Hủy", null)
                    .show();
        } else {
            String startTimeStr = new SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(new Date());
            DeviceCard newCard = new DeviceCard(
                    equipment.getEquipmentCode(),
                    equipment.getEquipmentName(),
                    startTimeStr,
                    type,
                    problem,
                    selectedOptions,
                    equipment.getEquipmentId(),
                    imagePaths // ĐỔI: Lưu paths thay vì URLs
            );
            deviceCards.put(currentDeviceCode, newCard);
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

    // CẬP NHẬT phương thức requestCamera()
    @Override
    public void requestCamera() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.CAMERA}, AddTechnicalSupportImagesDialog.CAMERA_PERMISSION_REQUEST);
            return;
        }

        Intent takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        if (takePictureIntent.resolveActivity(getPackageManager()) != null) {
            File photoFile = null;
            try {
                photoFile = createImageFile();
            } catch (IOException ex) {
                Toast.makeText(this, "Lỗi tạo file ảnh", Toast.LENGTH_SHORT).show();
                return;
            }
            if (photoFile != null) {
                // LƯU URI ĐỂ SỬ DỤNG SAU
                currentPhotoUri = FileProvider.getUriForFile(this, "com.example.fitsforkip.fileprovider", photoFile);
                takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, currentPhotoUri);
                startActivityForResult(takePictureIntent, AddTechnicalSupportImagesDialog.REQUEST_CAMERA);
            }
        }
    }

    @Override
    public void requestGallery() {
        Intent intent = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
        startActivityForResult(intent, AddTechnicalSupportImagesDialog.REQUEST_GALLERY);
    }

    private File createImageFile() throws IOException {
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(new Date());
        String imageFileName = "JPEG_" + timeStamp + "_";
        File storageDir = getExternalFilesDir("Pictures");
        File image = File.createTempFile(imageFileName, ".jpg", storageDir);
        return image;
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
        Integer equipmentId;
        List<String> imagePaths; // ĐỔI: Lưu paths thay vì URLs
        Integer lineId;
        String lineName;

        DeviceCard(String deviceCode, String deviceName, String startTime, String type, String problem,
                   List<String> selectedOptions, Integer equipmentId, List<String> imagePaths) {
            this.deviceCode = deviceCode;
            this.deviceName = deviceName;
            this.startTime = startTime;
            this.type = type;
            this.problem = problem;
            this.selectedOptions = selectedOptions;
            this.equipmentId = equipmentId;
            this.imagePaths = imagePaths; // Lưu paths
            this.totalElapsed = 0;
            this.lastStartTime = 0;
            this.isTimerRunning = false;
            this.timerHandler = new Handler();

            cardView = getLayoutInflater().inflate(R.layout.item_device_card, llDeviceCardsContainer, false);
            llDeviceCardsContainer.addView(cardView);

            TextView tvDeviceCode = cardView.findViewById(R.id.tv_device_code);
            TextView tvDeviceName = cardView.findViewById(R.id.tv_device_name);
            TextView tvStartTime = cardView.findViewById(R.id.tv_start_time);
            TextView tvType = cardView.findViewById(R.id.tv_type);
            TextView tvProblem = cardView.findViewById(R.id.tv_problem);
            tvRunningTime = cardView.findViewById(R.id.tv_running_time);
            btnToggleTimer = cardView.findViewById(R.id.btn_toggle_timer);

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

            startTimer();
            btnToggleTimer.setOnClickListener(v -> toggleTimer());
        }

        // Trong class DeviceCard, cập nhật constructor
        DeviceCard(String deviceCode, String deviceName, String startTime, String type, String problem,
                   List<String> selectedOptions, Integer equipmentId, List<String> imagePaths, String lineName) {
            this.deviceCode = deviceCode;
            this.deviceName = deviceName;
            this.startTime = startTime;
            this.type = type;
            this.problem = problem;
            this.selectedOptions = selectedOptions;
            this.equipmentId = equipmentId;
            this.imagePaths = imagePaths;
            this.lineName = lineName; // Lưu tên dây chuyền
            this.totalElapsed = 0;
            this.lastStartTime = 0;
            this.isTimerRunning = false;
            this.timerHandler = new Handler();

            cardView = getLayoutInflater().inflate(R.layout.item_device_card, llDeviceCardsContainer, false);
            llDeviceCardsContainer.addView(cardView);

            TextView tvDeviceCode = cardView.findViewById(R.id.tv_device_code);
            TextView tvDeviceName = cardView.findViewById(R.id.tv_device_name);
            TextView tvStartTime = cardView.findViewById(R.id.tv_start_time);
            TextView tvType = cardView.findViewById(R.id.tv_type);
            TextView tvProblem = cardView.findViewById(R.id.tv_problem);
            tvRunningTime = cardView.findViewById(R.id.tv_running_time);
            btnToggleTimer = cardView.findViewById(R.id.btn_toggle_timer);

            // Ẩn Mã TB và Tên TB nếu equipmentId == null
            if (equipmentId == null) {
                tvDeviceCode.setVisibility(View.GONE);
                //tvDeviceName.setVisibility(View.GONE);

                tvDeviceName.setText("Dây chuyền: " + lineName);
                tvStartTime.setText("TG BD: " + startTime);
                tvType.setText("Loại: " + type);
                if (!problem.isEmpty()) {
                    tvProblem.setText("Vấn đề: " + problem);
                    tvProblem.setVisibility(View.VISIBLE);
                } else {
                    tvProblem.setVisibility(View.GONE);
                }
            } else {
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
            }

            startTimer();
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
                totalElapsed += System.currentTimeMillis() - lastStartTime;
                isTimerRunning = false;
                btnToggleTimer.setImageResource(android.R.drawable.ic_media_play);
                timerHandler.removeCallbacks(timerRunnable);
            } else {
                lastStartTime = System.currentTimeMillis();
                isTimerRunning = true;
                btnToggleTimer.setImageResource(android.R.drawable.ic_media_pause);
                timerHandler.post(timerRunnable);
            }
        }

        void stopAndRemove() {
            if (isTimerRunning) {
                totalElapsed += System.currentTimeMillis() - lastStartTime;
                timerHandler.removeCallbacks(timerRunnable);
            }

            long totalSeconds = totalElapsed / 1000;
            int hours = (int) (totalSeconds / 3600);
            int minutes = (int) ((totalSeconds % 3600) / 60);
            int seconds = (int) (totalSeconds % 60);
            String totalTime = String.format("%02d:%02d:%02d", hours, minutes, seconds);

            double durationMinutes = totalElapsed / (1000.0 * 60.0);

            int typeId;
            boolean isTechSupport;
            if (selectedOptions.contains("Phế phẩm")) {
                isTechSupport = false;
                typeId = 3;
            } else if (selectedOptions.contains("Vệ sinh đầu/cuối ca")) {
                isTechSupport = false;
                typeId = 4;
            } else if (selectedOptions.contains("Đổi mã")) {
                isTechSupport = false;
                typeId = 5;
            } else {
                if (durationMinutes > 5) {
                    typeId = 2;
                } else {
                    typeId = 1;
                }
                if (selectedOptions.contains("Cần hỗ trợ kỹ thuật")) {
                    isTechSupport = true;
                } else {
                    isTechSupport = false;
                }
            }

            String status = "Hoàn thành";
            Integer equipmentId = this.equipmentId;
            Integer lineId = HomeActivity.this.lineId;
            List<String> imagePaths = this.imagePaths;

            Date startDate = new Date();
            Date endDate = new Date();
            startDate.setTime(endDate.getTime() - totalElapsed);

            IncidentHistoryEntity entity = new IncidentHistoryEntity(
                    equipmentId,
                    startDate,
                    endDate,
                    durationMinutes,
                    typeId,
                    "",
                    "",
                    problem,
                    status,
                    new Date(),
                    userId,
                    "",
                    isTechSupport,
                    false,
                    imagePaths, // Lưu paths vào DB
                    new ArrayList<>(), // imageUrls sẽ được cập nhật sau khi upload
                    lineId
            );

            // MỚI: Upload ảnh TRƯỚC KHI insert/upload incident
            new Thread(() -> {
                List<String> uploadedUrls = new ArrayList<>();

                // Upload từng ảnh
                for (String imagePath : imagePaths) {
                    //String url = uploadImageSync(imagePath);
                    String url = HomeActivity.this.uploadImageSync(imagePath);
                    if (url != null) {
                        uploadedUrls.add(url);
                    }
                }

                // Cập nhật URLs vào entity
                entity.setImageUrls(uploadedUrls);

                // Insert vào DB
                AppDatabase db = AppDatabaseSingleton.getInstance(HomeActivity.this);
                long id = db.incidentHistoryDao().insert(entity);
                entity.setIncidentId((int)id);

                android.util.Log.d("Incident", "Đã thêm sự cố: ID=" + id + ", Images=" + uploadedUrls.size());

                // Upload incident lên server
                //uploadIncidentToServer(entity, id);
                HomeActivity.this.uploadIncidentToServer(entity, id);
            }).start();

            Toast.makeText(HomeActivity.this, "Thiết bị " + deviceCode + " tổng thời gian: " + totalTime, Toast.LENGTH_SHORT).show();

            llDeviceCardsContainer.removeView(cardView);
            deviceCards.remove(deviceCode);
        }

        // MỚI: Upload ảnh đồng bộ (gọi trong background thread)
//        private String uploadImageSync(String imagePath) {
//            try {
//                android.util.Log.d("UploadImage", "Đang upload: " + imagePath);
//
//                File file = new File(imagePath);
//                if (!file.exists()) {
//                    android.util.Log.e("UploadImage", "File không tồn tại: " + imagePath);
//                    return null;
//                }
//
//                RequestBody requestFile = RequestBody.create(MediaType.parse("image/*"), file);
//                MultipartBody.Part body = MultipartBody.Part.createFormData("imageFile", file.getName(), requestFile);
//
//                SharedPreferences prefs = getSharedPreferences("AppPrefs", MODE_PRIVATE);
//                String token = prefs.getString("token", null);
//                if (token == null) {
//                    android.util.Log.e("UploadImage", "Không tìm thấy token");
//                    return null;
//                }
//
//                ApiService apiService = ApiClient.getAuthenticatedClient(HomeActivity.this).create(ApiService.class);
//                Call<ApiResponse<UploadImageResponse>> call = apiService.uploadImage("Bearer " + token, body);
//
//                // Thực thi đồng bộ
//                Response<ApiResponse<UploadImageResponse>> response = call.execute();
//
//                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
//                    String url = response.body().getData().getImageUrl();
//                    android.util.Log.d("UploadImage", "Upload thành công: " + url);
//                    return url;
//                } else {
//                    android.util.Log.e("UploadImage", "Upload thất bại: " + response.code());
//                    return null;
//                }
//            } catch (Exception e) {
//                android.util.Log.e("UploadImage", "Lỗi upload: " + e.getMessage());
//                e.printStackTrace();
//                return null;
//            }
//        }
//
//        private void uploadIncidentToServer(IncidentHistoryEntity entity, long localId) {
//            SharedPreferences prefs = getSharedPreferences("AppPrefs", MODE_PRIVATE);
//            String token = prefs.getString("token", null);
//
//            if (token == null) {
//                android.util.Log.e("Upload sự cố", "Không tìm thấy token xác thực");
//                return;
//            }
//
//            CreateIncidentRequest incidentRequest = new CreateIncidentRequest();
//            incidentRequest.setEquipmentId(entity.getEquipmentId());
//            incidentRequest.setLineId(HomeActivity.this.lineId);
//            incidentRequest.setStartTime(formatDate(entity.getStartTime()));
//            incidentRequest.setEndTime(formatDate(entity.getEndTime()));
//            incidentRequest.setDuration(entity.getDuration());
//            incidentRequest.setTypeId(entity.getTypeId());
//            incidentRequest.setReason(entity.getReason());
//            incidentRequest.setSolution(entity.getSolution());
//            incidentRequest.setIssue(entity.getIssue());
//            incidentRequest.setStatus(entity.getStatus());
//            incidentRequest.setCreatedDate(formatDate(entity.getCreatedDate()));
//            incidentRequest.setReportedByUserId(entity.getReportedByUserId());
//            incidentRequest.setTechSupport(entity.isTechSupport());
//            incidentRequest.setImageUrls(entity.getImageUrls()); // Gửi URLs đã upload
//
//            CreateBulkIncidentRequest bulkRequest = new CreateBulkIncidentRequest();
//            bulkRequest.setIncidents(Arrays.asList(incidentRequest));
//
//            ApiService apiService = ApiClient.getClient().create(ApiService.class);
//            Call<ApiResponse<BulkIncidentResponse>> call = apiService.createBulkIncidents("Bearer " + token, bulkRequest);
//            call.enqueue(new Callback<ApiResponse<BulkIncidentResponse>>() {
//                @Override
//                public void onResponse(Call<ApiResponse<BulkIncidentResponse>> call, Response<ApiResponse<BulkIncidentResponse>> response) {
//                    if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
//                        BulkIncidentResponse bulkResponse = response.body().getData();
//                        if (bulkResponse.getSuccessCount() > 0) {
//                            new Thread(() -> {
//                                AppDatabase db = AppDatabaseSingleton.getInstance(HomeActivity.this);
//                                db.incidentHistoryDao().updateSyncedStatus((int) localId, true);
//                                android.util.Log.d("Upload sự cố", "Tải lên thành công, cập nhật đồng bộ cho ID=" + localId);
//                            }).start();
//                        } else {
//                            android.util.Log.e("Upload sự cố", "Upload thất bại: " + bulkResponse.getErrors().get(0).getErrorMessage());
//                        }
//                    } else {
//                        android.util.Log.e("Upload sự cố", "Upload lỗi: " + response.message());
//                    }
//                }
//
//                @Override
//                public void onFailure(Call<ApiResponse<BulkIncidentResponse>> call, Throwable t) {
//                    android.util.Log.e("Upload sự cố", "Upload lỗi: " + t.getMessage(), t);
//                }
//            });
//        }

//        private String formatDate(Date date) {
//            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault());
//            return sdf.format(date);
//        }
    }


    // DÁN VÀO TRONG HomeActivity, NGAY SAU createImageFile() HOẶC TRƯỚC DeviceCard
    private String uploadImageSync(String imagePath) {
        try {
            Log.d("UploadImage", "Đang upload: " + imagePath);

            File file = new File(imagePath);
            if (!file.exists()) {
                Log.e("UploadImage", "File không tồn tại: " + imagePath);
                return null;
            }

            RequestBody requestFile = RequestBody.create(MediaType.parse("image/*"), file);
            MultipartBody.Part body = MultipartBody.Part.createFormData("imageFile", file.getName(), requestFile);

            SharedPreferences prefs = getSharedPreferences("AppPrefs", MODE_PRIVATE);
            String token = prefs.getString("token", null);
            if (token == null) {
                Log.e("UploadImage", "Không tìm thấy token");
                return null;
            }

            ApiService apiService = ApiClient.getAuthenticatedClient(this).create(ApiService.class);
            Call<ApiResponse<UploadImageResponse>> call = apiService.uploadImage("Bearer " + token, body);

            Response<ApiResponse<UploadImageResponse>> response = call.execute();

            if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                String url = response.body().getData().getImageUrl();
                Log.d("UploadImage", "Upload thành công: " + url);
                return url;
            } else {
                Log.e("UploadImage", "Upload thất bại: " + response.code());
                return null;
            }
        } catch (Exception e) {
            Log.e("UploadImage", "Lỗi upload: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    private void uploadIncidentToServer(IncidentHistoryEntity entity, long localId) {
        SharedPreferences prefs = getSharedPreferences("AppPrefs", MODE_PRIVATE);
        String token = prefs.getString("token", null);

        if (token == null) {
            Log.e("Upload sự cố", "Không tìm thấy token xác thực");
            return;
        }

        CreateIncidentRequest incidentRequest = new CreateIncidentRequest();
        incidentRequest.setEquipmentId(entity.getEquipmentId());
        incidentRequest.setLineId(lineId);
        incidentRequest.setStartTime(formatDate(entity.getStartTime()));
        // endTime = null → không set
        if (entity.getEndTime() != null) {
            incidentRequest.setEndTime(formatDate(entity.getEndTime()));
        }
        incidentRequest.setDuration(entity.getDuration());
        incidentRequest.setTypeId(entity.getTypeId());
        incidentRequest.setReason(entity.getReason());
        incidentRequest.setSolution(entity.getSolution());
        incidentRequest.setIssue(entity.getIssue());
        incidentRequest.setStatus(entity.getStatus());
        incidentRequest.setCreatedDate(formatDate(entity.getCreatedDate()));
        incidentRequest.setReportedByUserId(entity.getReportedByUserId());
        incidentRequest.setTechSupport(entity.isTechSupport());
        incidentRequest.setImageUrls(entity.getImageUrls());

        CreateBulkIncidentRequest bulkRequest = new CreateBulkIncidentRequest();
        bulkRequest.setIncidents(Arrays.asList(incidentRequest));

        ApiService apiService = ApiClient.getClient().create(ApiService.class);
        Call<ApiResponse<BulkIncidentResponse>> call = apiService.createBulkIncidents("Bearer " + token, bulkRequest);
        call.enqueue(new Callback<ApiResponse<BulkIncidentResponse>>() {
            @Override
            public void onResponse(Call<ApiResponse<BulkIncidentResponse>> call, Response<ApiResponse<BulkIncidentResponse>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    BulkIncidentResponse bulkResponse = response.body().getData();
                    if (bulkResponse.getSuccessCount() > 0) {
                        new Thread(() -> {
                            AppDatabase db = AppDatabaseSingleton.getInstance(HomeActivity.this);
                            db.incidentHistoryDao().updateSyncedStatus((int) localId, true);
                            Log.d("Upload sự cố", "Tải lên thành công, cập nhật đồng bộ cho ID=" + localId);
                        }).start();
                    } else {
                        Log.e("Upload sự cố", "Upload thất bại: " + bulkResponse.getErrors().get(0).getErrorMessage());
                    }
                } else {
                    Log.e("Upload sự cố", "Upload lỗi: " + response.message());
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<BulkIncidentResponse>> call, Throwable t) {
                Log.e("Upload sự cố", "Upload lỗi: " + t.getMessage(), t);
            }
        });
    }

    private String formatDate(Date date) {
        if (date == null) return null;
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault());
        return sdf.format(date);
    }


    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == AddTechnicalSupportImagesDialog.CAMERA_PERMISSION_REQUEST) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                // Permission granted, thử lại requestCamera
                requestCamera();
            } else {
                Toast.makeText(this, "Quyền truy cập camera bị từ chối", Toast.LENGTH_SHORT).show();
            }
        }
    }
}
