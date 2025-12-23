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
import com.example.fitsforkip.ui.scan.SpecialQRInfoDialog;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.android.material.navigation.NavigationView;
import com.google.android.material.card.MaterialCardView;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
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
    private long currentScanTime;
    private long currentSecondScanTime;  // Thêm biến này, tương tự currentScanTime

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

            // ← THÊM: Kiểm tra xem là QR code đặc biệt không
            String lineCode = getLineCodeFromLineId(lineId);
            SpecialQRType specialType = checkSpecialQRCode(qrCode, lineCode);

            if (specialType != SpecialQRType.NONE) {
                // ← XỬ LÝ QR CODE ĐẶC BIỆT (Vệ sinh / Đổi mã)
                handleSpecialQRCode(qrCode, specialType, prodLine);
                return; // ← LƯU Ý: Return để tránh tìm kiếm thiết bị
            }

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

            // Lưu thời điểm scan QR lần 1
            if (!deviceCards.containsKey(currentDeviceCode)) {
                currentScanTime = System.currentTimeMillis(); // Thời điểm scan lần 1
            }

            if (deviceCards.containsKey(currentDeviceCode)) {
                // Second scan: directly show confirmation dialog
                // Second scan: NGAY LẬP TỨC ghi nhận endTime và hiển thị dialog
                currentSecondScanTime = System.currentTimeMillis();  // ← THÊM: Ghi nhận endTime ngay khi scan lần 2
                showStopConfirmationDialog(currentDeviceCode);
            } else {
                // First scan: TẠO DEVICE CARD NGAY LẬP TỨC + START TIMER
                // Không đợi dialog hoàn tất
                createDeviceCardAndStartTimer(equipment);

                // Sau đó mới hiển thị dialog để người dùng chọn vấn đề
                DeviceInfoDialog dialog = new DeviceInfoDialog(this, equipment, this);
                dialog.show();
            }
        } else if (requestCode == AddTechnicalSupportImagesDialog.REQUEST_CAMERA) {
            if (resultCode == RESULT_OK && currentImageDialog != null) {
                Intent cameraData = new Intent();
                cameraData.setData(currentPhotoUri);
                currentImageDialog.onActivityResult(requestCode, resultCode, cameraData);
            }
        } else if (requestCode == AddTechnicalSupportImagesDialog.REQUEST_GALLERY) {
            if (currentImageDialog != null) {
                currentImageDialog.onActivityResult(requestCode, resultCode, data);
            }
        }
    }

    // Sửa method createDeviceCardAndStartTimer() - kiểm tra xem có phải kỹ thuật support không
    private void createDeviceCardAndStartTimer(Equipment equipment) {
        // KIỂM TRA: Nếu chế độ hiện tại là chọn kỹ thuật support → không tạo card
        // Sẽ được xử lý riêng trong handleTechnicalSupport()

        String startTimeStr = new SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(new Date(currentScanTime));

        // Tạo card với thông tin equipment và ngay lập tức bắt đầu chạy timer
        DeviceCard card = new DeviceCard(
                equipment.getEquipmentCode(),
                equipment.getEquipmentName(),
                startTimeStr,
                "", // type sẽ cập nhật sau khi dialog OK
                "", // problem sẽ cập nhật sau khi dialog OK
                new ArrayList<>(), // selectedOptions sẽ cập nhật sau khi dialog OK
                equipment.getEquipmentId(),
                new ArrayList<>(), // imagePaths sẽ cập nhật sau khi dialog OK
                currentScanTime
        );

        deviceCards.put(currentDeviceCode, card);
        // Timer đã bắt đầu chạy tự động trong constructor của DeviceCard
    }

    private void showStopConfirmationDialog(String deviceCode) {
        DeviceCard card = deviceCards.get(deviceCode);
        // Pause the timer when showing the modal
        //card.pauseTimer();
        // Pause timer NGAY LẬP TỨC với endTime từ scan lần 2
        card.pauseTimer(currentSecondScanTime);  // ← SỬA: Truyền currentSecondScanTime

        //long currentElapsed = card.totalRunningTime + card.totalElapsed;
        //if (card.isTimerRunning) {
        //    currentElapsed += System.currentTimeMillis() - card.lastStartTime;
        //}
        // Tính toán thời gian chạy dựa trên totalRunningTime (đã cập nhật với endTime)
        long currentElapsed = card.totalRunningTime;  // ← SỬA: Dùng totalRunningTime trực tiếp (đã bao gồm đến endTime)
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
                    // Immediately stop and remove without delay
                    card.stopAndRemove();
                    deviceCards.remove(deviceCode);
                    hideLoading();
                    //Toast.makeText(HomeActivity.this, "Đã ghi nhận thành công cho thiết bị " + deviceCode, Toast.LENGTH_SHORT).show();
                })
                .setNegativeButton("Hủy", (dialog, which) -> {
                    // Resume the timer if canceled
                    card.resumeTimer();
                })
                .show();
    }

    @Override
    public void onOptionsSelected(List<String> selectedOptions) {
         //← THÊM: Kiểm tra TRƯỚC TIÊN nếu rỗng → hủy
        //if (selectedOptions == null || selectedOptions.isEmpty()) {
         //   handleDialogCanceled();
         //   return;
        //}

        // TRƯỜNG HỢP ĐẶC BIỆT: Chọn "Cần hỗ trợ kỹ thuật" (kết hợp với van de moi khong phai loại khác)
        //selectedOptions.size() == 1 &&
        if (selectedOptions.contains("Cần hỗ trợ kỹ thuật")) {
            handleTechnicalSupport(selectedOptions);
        } else if (selectedOptions.contains("Vệ sinh đầu/cuối ca") || selectedOptions.contains("Đổi mã")) {
            handleSpecialIncidents(selectedOptions);
        } else {
            handleOtherIncidents(selectedOptions);
        }
    }

    // ← THÊM: Method xử lý khi dialog bị đóng/hủy
    private void handleDialogCanceled() {
        // Xóa device card nếu tạo rồi
        if (deviceCards.containsKey(currentDeviceCode)) {
            DeviceCard card = deviceCards.get(currentDeviceCode);
            card.stopTimer(); // Dừng timer
            llDeviceCardsContainer.removeView(card.cardView);
            deviceCards.remove(currentDeviceCode);
            Toast.makeText(this, "Đã hủy bỏ ghi nhận", Toast.LENGTH_SHORT).show();
        }
    }

    private void handleTechnicalSupport(List<String> selectedOptions) {
        Equipment equipment = findEquipmentByQrCode();
        if (equipment == null) {
            Toast.makeText(this, "Không tìm thấy thiết bị", Toast.LENGTH_SHORT).show();
            return;
        }

        // XÓA device card nếu đã tạo (vì không cần timer cho tech support)
        if (deviceCards.containsKey(currentDeviceCode)) {
            DeviceCard card = deviceCards.get(currentDeviceCode);
            card.stopTimer(); // Dừng timer
            llDeviceCardsContainer.removeView(card.cardView);
            deviceCards.remove(currentDeviceCode);
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

        Date startTime = new Date(currentScanTime);
        double durationMinutes = 0;
        Integer typeId = null;
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
                null,
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

        new Thread(() -> {
            try {
                // BƯỚC 1: Upload ảnh
                List<String> uploadedUrls = new ArrayList<>();
                for (String path : imagePaths) {
                    String url = uploadImageSync(path);
                    if (url != null) uploadedUrls.add(url);
                }
                entity.setImageUrls(uploadedUrls);

                // BƯỚC 2: Lưu DB (LOCAL SAVE)
                AppDatabase db = AppDatabaseSingleton.getInstance(this);
                long id = db.incidentHistoryDao().insert(entity);
                entity.setIncidentId((int)id);
                Log.d("TechSupport", "✓ Lưu local thành công, ID=" + id);

                // BƯỚC 3: Upload lên server
                uploadIncidentToServerWithCallback(entity, id, new UploadCallback() {
                    @Override
                    public void onSuccess() {
                        runOnUiThread(() -> {
                            hideLoading();
                            Toast.makeText(HomeActivity.this,
                                    "Đã gửi yêu cầu hỗ trợ kỹ thuật thành công!",
                                    Toast.LENGTH_LONG).show();
                        });
                    }

                    @Override
                    public void onFailure(String errorMsg) {
                        runOnUiThread(() -> {
                            hideLoading();
                            Toast.makeText(HomeActivity.this,
                                    "Đã lưu cục bộ nhưng chưa kết nối server.",
                                            //"Vui lòng kiểm tra lại từ Lịch sử sự cố.\n" +
                                            //"Lỗi: " + errorMsg,
                                    Toast.LENGTH_LONG).show();
                            Log.e("TechSupport", "Upload server thất bại: " + errorMsg);
                        });
                    }
                });

            } catch (Exception e) {
                runOnUiThread(() -> {
                    hideLoading();
                    Toast.makeText(HomeActivity.this,
                            "Lỗi: " + e.getMessage(),
                            Toast.LENGTH_SHORT).show();
                    Log.e("TechSupport", "Lỗi: " + e.getMessage(), e);
                });
            }
        }).start();
    }

    private void handleSpecialIncidents(List<String> selectedOptions) {
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
            // Card đã tồn tại → CẬP NHẬT thông tin
            DeviceCard card = deviceCards.get(currentDeviceCode);
            card.updateIncidentInfo(finalType, finalProblem, selectedOptions);
        } else {
            String startTimeStr = new SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(new Date(currentScanTime));
            DeviceCard card = new DeviceCard(
                    "", "", startTimeStr, finalType, finalProblem, selectedOptions, null, new ArrayList<>(), productionLine, currentScanTime
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
            // Card đã tồn tại → CẬP NHẬT thông tin type, problem, selectedOptions
            DeviceCard card = deviceCards.get(currentDeviceCode);
            card.updateIncidentInfo(finalType, finalProblem, selectedOptions);
            // Timer vẫn tiếp tục chạy, không reset
        } else {
            // Không nên vào đây nữa vì đã tạo card trong createDeviceCardAndStartTimer()
            // Nhưng giữ lại để an toàn
            String startTimeStr = new SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(new Date(currentScanTime));
            DeviceCard card = new DeviceCard(
                    equipment.getEquipmentCode(),
                    equipment.getEquipmentName(),
                    startTimeStr,
                    finalType,
                    finalProblem,
                    selectedOptions,
                    equipment.getEquipmentId(),
                    new ArrayList<>(),
                    currentScanTime
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
            String startTimeStr = new SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(new Date(currentScanTime));
            DeviceCard newCard = new DeviceCard(
                    equipment.getEquipmentCode(),
                    equipment.getEquipmentName(),
                    startTimeStr,
                    type,
                    problem,
                    selectedOptions,
                    equipment.getEquipmentId(),
                    imagePaths,
                    currentScanTime // ← THÊM THAM SỐ NÀY
            );
            deviceCards.put(currentDeviceCode, newCard);
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
        long initialStartTime;              // Thời điểm scan QR lần 1 (23:01:11)
        long totalRunningTime = 0;          // Tổng thời gian chạy thực tế (loại bỏ thời gian dừng)
        long lastStopTime = 0;              // Thời điểm cuối cùng bấm STOP
        List<long[]> runningIntervals = new ArrayList<>(); // Mỗi phần tử: {startMillis, endMillis}
        long endTime = 0;  // ← THÊM: Biến để lưu endTime tạm thời

        DeviceCard(String deviceCode, String deviceName, String startTime, String type, String problem,
                   List<String> selectedOptions, Integer equipmentId, List<String> imagePaths, long scanTime) { // ← THÊM scanTime
            this.deviceCode = deviceCode;
            this.deviceName = deviceName;
            this.startTime = startTime;
            this.type = type;
            this.problem = problem;
            this.selectedOptions = selectedOptions;
            this.equipmentId = equipmentId;
            this.imagePaths = imagePaths;
            this.totalElapsed = 0;
            this.lastStartTime = 0;
            this.isTimerRunning = false;
            this.timerHandler = new Handler();
            this.initialStartTime = scanTime; // ← ĐỔI: Dùng scanTime thay vì System.currentTimeMillis()
            this.runningIntervals = new ArrayList<>();

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
                   List<String> selectedOptions, Integer equipmentId, List<String> imagePaths, String lineName, long scanTime) { // ← THÊM scanTime
            this.deviceCode = deviceCode;
            this.deviceName = deviceName;
            this.startTime = startTime;
            this.type = type;
            this.problem = problem;
            this.selectedOptions = selectedOptions;
            this.equipmentId = equipmentId;
            this.imagePaths = imagePaths;
            this.lineName = lineName;
            this.totalElapsed = 0;
            this.lastStartTime = 0;
            this.isTimerRunning = false;
            this.timerHandler = new Handler();
            this.initialStartTime = scanTime; // ← ĐỔI: Dùng scanTime thay vì System.currentTimeMillis()
            this.runningIntervals = new ArrayList<>();

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

            // Add new running interval
            runningIntervals.add(new long[]{lastStartTime, 0});

            timerRunnable = new Runnable() {
                @Override
                public void run() {
                    if (isTimerRunning) {
                        totalElapsed += System.currentTimeMillis() - lastStartTime;
                        lastStartTime = System.currentTimeMillis();

                        long elapsed = totalRunningTime + totalElapsed;
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
        // ============ FIX trong method toggleTimer() của class DeviceCard ============

        void toggleTimer() {
            if (isTimerRunning) {
                // Đang chạy → bấm STOP
                long currentTime = System.currentTimeMillis();

                // TÍNH THỜI GIAN CHẠY thực tế từ lần START cuối cùng đến lúc STOP
                // Dùng totalElapsed (đã tích lũy từ lúc scan QR) thay vì lastStartTime
                totalElapsed += currentTime - lastStartTime;
                isTimerRunning = false;

                // Thêm totalElapsed vào totalRunningTime (chỉ tính thời gian chạy thực tế)
                totalRunningTime += totalElapsed;

                // GHI NHẬN thời điểm STOP lần này
                lastStopTime = currentTime;

                // Set end time for the last interval
                if (!runningIntervals.isEmpty()) {
                    runningIntervals.get(runningIntervals.size() - 1)[1] = currentTime;
                }

                btnToggleTimer.setImageResource(android.R.drawable.ic_media_play);
                timerHandler.removeCallbacks(timerRunnable);

                // RESET totalElapsed cho segment tiếp theo
                totalElapsed = 0;

                // Update display immediately after pausing
                long elapsed = totalRunningTime;
                int seconds = (int) (elapsed / 1000) % 60;
                int minutes = (int) ((elapsed / (1000 * 60)) % 60);
                int hours = (int) ((elapsed / (1000 * 60 * 60)) % 24);
                tvRunningTime.setText(String.format("Thời gian chạy: %02d:%02d:%02d", hours, minutes, seconds));

            } else {
                // Đã dừng → tiếp tục chạy
                lastStartTime = System.currentTimeMillis();
                isTimerRunning = true;
                btnToggleTimer.setImageResource(android.R.drawable.ic_media_pause);

                // Add new running interval
                runningIntervals.add(new long[]{lastStartTime, 0});

                timerHandler.post(timerRunnable);
            }
        }

        // ============ SỬA trong method stopAndRemove() ============
        // 2. SỬA stopAndRemove() trong DeviceCard - Phân biệt local save vs server sync
        void stopAndRemove() {
            // Tính toán time
            if (isTimerRunning) {
                long lastSegment = System.currentTimeMillis() - lastStartTime;
                totalElapsed += lastSegment;
                totalRunningTime += lastSegment;
                timerHandler.removeCallbacks(timerRunnable);

                if (!runningIntervals.isEmpty()) {
                    runningIntervals.get(runningIntervals.size() - 1)[1] = System.currentTimeMillis();
                }
            }

            if (lastStopTime == 0) {
                lastStopTime = System.currentTimeMillis();
            }

            if (!runningIntervals.isEmpty()) {
                long[] lastInterval = runningIntervals.get(runningIntervals.size() - 1);
                if (lastInterval[1] == 0) {
                    lastInterval[1] = System.currentTimeMillis();
                }
            }

//            double durationMinutes = totalRunningTime / (1000.0 * 60.0);
//            // Tính adjustedDuration (đã trừ break time và chỉ trong 7:00-23:00)
//            long durationForBreakCalc = totalRunningTime;
//            double adjustedDuration = calculateDurationWithBreakDeductionFromMillis(durationForBreakCalc);
//
//            // ← THÊM LOG DEBUG: Kiểm tra adjustedDuration trước khi làm tròn
//            Log.d("DurationDebug", "adjustedDuration trước làm tròn: " + adjustedDuration);
//
//            //double roundedDuration = Math.floor(adjustedDuration * 100) / 100;
//            // ← SỬA: Sử dụng làm tròn chính xác hơn để tránh floating-point errors
//            // Thay vì Math.floor, dùng BigDecimal hoặc làm tròn thủ công
//            double roundedDuration = Math.round(adjustedDuration * 100.0) / 100.0;  // Làm tròn đến 2 chữ số thập phân (0.456 → 0.46, 0.454 → 0.45)
//            // Hoặc dùng BigDecimal cho chính xác hơn:
//            // import java.math.BigDecimal;
//            // import java.math.RoundingMode;
//            // BigDecimal bd = new BigDecimal(adjustedDuration).setScale(2, RoundingMode.DOWN);  // Làm tròn xuống
//            // double roundedDuration = bd.doubleValue();
//            // ← THÊM LOG DEBUG: Kiểm tra sau làm tròn
//            Log.d("DurationDebug", "roundedDuration sau làm tròn: " + roundedDuration);
//            // ← THÊM: Tính thời gian thực tế từ start/end time để đảm bảo không vượt quá
//            long actualMillis = System.currentTimeMillis() - initialStartTime;
//            double actualMinutes = actualMillis / (1000.0 * 60.0);
//            double finalDuration = Math.min(roundedDuration, actualMinutes);  // Không vượt quá thời gian thực tế
//            Log.d("DurationDebug", "actualMinutes từ start/end: " + actualMinutes + ", finalDuration: " + finalDuration);

            // ← SỬA THÀNH (ĐÚNG):
// BƯỚC 1: Tính thời gian thực tế từ startTime → endTime (không được vượt quá)
            long actualDurationMillis = (this.endTime > 0 ? this.endTime : System.currentTimeMillis()) - initialStartTime;
            double actualDurationMinutes = actualDurationMillis / (1000.0 * 60.0);

// BƯỚC 2: Tính adjustedDuration (đã trừ break time)
            long durationForBreakCalc = totalRunningTime;
            double adjustedDuration = calculateDurationWithBreakDeductionFromMillis(durationForBreakCalc);

// BƯỚC 3: Làm tròn
            //double roundedDuration = Math.floor(adjustedDuration * 100.0) / 100.0;
            double roundedDuration = smartRoundDuration(adjustedDuration);

// BƯỚC 4: ✅ VALIDATION - Không được vượt quá thời gian thực tế
            double minDuration = Math.min(roundedDuration, actualDurationMinutes);
            //double finalDuration = Math.floor(minDuration * 100.0) / 100.0;
            double finalDuration = smartRoundDuration(minDuration);

// BƯỚC 5: Log để debug
            Log.d("DurationDebug", "actualDurationMinutes: " + actualDurationMinutes);
            Log.d("DurationDebug", "adjustedDuration (after break deduction): " + adjustedDuration);
            Log.d("DurationDebug", "roundedDuration: " + roundedDuration);
            Log.d("DurationDebug", "finalDuration (capped): " + finalDuration);

            Integer typeId;
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
            }
            //else if (type == null || type.isEmpty() || type.equals("Chưa xác định")) {
            //    // Duration < 5 phút → typeId = 1 (sự cố ngắn hạn)
            //    // Duration >= 5 phút → typeId = 2 (sự cố dài hạn)
            //    typeId = (durationMinutes < 5) ? 1 : 2;
            //    isTechSupport = false;
            //} else {
            //    typeId = (durationMinutes >= 5) ? 2 : 1;
            //    isTechSupport = selectedOptions.contains("Cần hỗ trợ kỹ thuật");
            //}
            else if (selectedOptions.contains("Cần hỗ trợ kỹ thuật")) {
                isTechSupport = true;
                typeId = null;
            } else {
                // Nếu không chọn "Phế phẩm" hay "Cần hỗ trợ kỹ thuật", dựa vào duration
                typeId = (finalDuration < 5) ? 1 : 2;
                isTechSupport = false;
            }

//        } else if (selectedOptions.contains("Cần hỗ trợ kỹ thuật")) {
//            // ← THÊM: Xử lý tech support
//            typeId = 2;
//            isTechSupport = true;
//        } else {
//            // ← THÊM: Nếu không chọn loại nào (selectedOptions rỗng hoặc chỉ có vấn đề khác)
//            // Dựa vào duration quyết định typeId
//            typeId = (durationMinutes >= 5) ? 2 : 1;  // ← SỬA: Dừng dài >= 5 phút, Dừng ngắn < 5 phút
//            isTechSupport = false;
//        }

            String status = "Hoàn thành";
            Integer equipmentId = this.equipmentId;
            Integer lineId = HomeActivity.this.lineId;

            Date startDate = new Date(initialStartTime);
            //Date endDate = new Date(System.currentTimeMillis());
            Date endDate = new Date(this.endTime);

            //long durationForBreakCalc = totalRunningTime;
            //double adjustedDuration = calculateDurationWithBreakDeductionFromMillis(durationForBreakCalc);
            //double roundedDuration = Math.floor(adjustedDuration * 100) / 100;

            IncidentHistoryEntity entity = new IncidentHistoryEntity(
                    equipmentId,
                    startDate,
                    endDate,
                    finalDuration,
                    typeId,
                    "",
                    "",
                    problem,
                    status,
                    new Date(),
                    HomeActivity.this.userId,
                    "",
                    isTechSupport,
                    false,
                    imagePaths,
                    new ArrayList<>(),
                    lineId
            );

            new Thread(() -> {
                try {
                    // BƯỚC 1: Upload ảnh
                    List<String> uploadedUrls = new ArrayList<>();
                    for (String imagePath : imagePaths) {
                        String url = HomeActivity.this.uploadImageSync(imagePath);
                        if (url != null) {
                            uploadedUrls.add(url);
                        }
                    }
                    entity.setImageUrls(uploadedUrls);

                    // BƯỚC 2: Lưu DB (LOCAL SAVE)
                    AppDatabase db = AppDatabaseSingleton.getInstance(HomeActivity.this);
                    long id = db.incidentHistoryDao().insert(entity);
                    entity.setIncidentId((int)id);
                    Log.d("Incident", "Lưu local thành công, ID=" + id);

                    // BƯỚC 3: Upload lên server (async callback)
                    HomeActivity.this.uploadIncidentToServerWithCallback(entity, id, new UploadCallback() {
                        @Override
                        public void onSuccess() {
                            String toastMessage = (equipmentId != null)
                                    ? "Đã ghi nhận & đồng bộ: Thiết bị " + deviceCode + " - " + finalDuration  + " phút"
                                    : "Đã ghi nhận & đồng bộ: " + type + " - " + finalDuration  + " phút";

                            runOnUiThread(() -> {
                                Toast.makeText(HomeActivity.this, toastMessage, Toast.LENGTH_LONG).show();
                            });
                        }

                        @Override
                        public void onFailure(String errorMsg) {
                            String toastMessage = (equipmentId != null)
                                    ? "Đã lưu cục bộ (chưa đồng bộ): Thiết bị " + deviceCode + " - " + finalDuration  + " phút"
                                    : "Đã lưu cục bộ (chưa đồng bộ): " + type + " - " + finalDuration  + " phút";

                            runOnUiThread(() -> {
                                Toast.makeText(HomeActivity.this,
                                        toastMessage + "\n" +
                                                "Kiểm tra Lịch sử sự cố.",
                                        Toast.LENGTH_LONG).show();
                            });
                            Log.e("Incident", "Upload server thất bại: " + errorMsg);
                        }
                    });

                } catch (Exception e) {
                    runOnUiThread(() -> {
                        Toast.makeText(HomeActivity.this, "Lỗi: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                        Log.e("Incident", "Lỗi: " + e.getMessage(), e);
                    });
                }
            }).start();

            llDeviceCardsContainer.removeView(cardView);
            deviceCards.remove(deviceCode);
        }


// ============ THÊM method mới: Smart Rounding ============

        /**
         * Làm tròn duration thông minh:
         * - Chữ số thứ 2 (hundredths) >= 6 → làm tròn lên
         * - Chữ số thứ 2 < 6 → làm tròn xuống
         *
         * Ví dụ:
         * 5.126 → 5.13 (chữ số thứ 3 là 6 >= 6, làm tròn lên)
         * 5.125 → 5.12 (chữ số thứ 3 là 5 < 6, làm tròn xuống)
         * 5.134 → 5.13 (chữ số thứ 3 là 4 < 6, làm tròn xuống)
         * 5.189 → 5.19 (chữ số thứ 3 là 9 >= 6, làm tròn lên)
         */
        private double smartRoundDuration(double duration) {
            // Nhân 1000 để lấy chữ số thứ 3
            double multiplied = duration * 1000;
            long digitThird = Math.round(multiplied) % 10; // Lấy chữ số thứ 3 (hàng phần nghìn)

            if (digitThird >= 6) {
                // Làm tròn lên: Math.ceil(duration * 100) / 100
                return Math.ceil(duration * 100) / 100.0;
            } else {
                // Làm tròn xuống: Math.floor(duration * 100) / 100
                return Math.floor(duration * 100) / 100.0;
            }
        }

        // ============ THÊM method mới: Tính break deduction từ milliseconds =====
        private double calculateDurationWithBreakDeductionFromMillis(long durationMillis) {
            // Now calculate based on running intervals, subtracting time outside 7:00-23:00
            double totalValidMinutes = 0.0;

            for (long[] interval : runningIntervals) {
                long start = interval[0];
                long end = interval[1];
                if (end == 0) continue; // Incomplete interval

                // Calculate valid time in this interval
                double validInInterval = calculateValidTimeInInterval(start, end);
                totalValidMinutes += validInInterval;
            }

            return totalValidMinutes;
        }

        private double calculateValidTimeInInterval(long startMillis, long endMillis) {
            // Giờ làm việc: 7:00 - 23:00
            Calendar workStart = Calendar.getInstance();
            workStart.setTimeInMillis(startMillis);
            workStart.set(Calendar.HOUR_OF_DAY, 7);
            workStart.set(Calendar.MINUTE, 0);
            workStart.set(Calendar.SECOND, 0);
            workStart.set(Calendar.MILLISECOND, 0);

            Calendar workEnd = Calendar.getInstance();
            workEnd.setTimeInMillis(startMillis);
            workEnd.set(Calendar.HOUR_OF_DAY, 23);
            workEnd.set(Calendar.MINUTE, 0);
            workEnd.set(Calendar.SECOND, 0);
            workEnd.set(Calendar.MILLISECOND, 0);

            // CHỈ TÍNH thời gian trong khoảng 7:00 - 23:00
            long effectiveStart = Math.max(startMillis, workStart.getTimeInMillis());
            long effectiveEnd = Math.min(endMillis, workEnd.getTimeInMillis());

            if (effectiveStart >= effectiveEnd) {
                return 0.0; // Không có thời gian hợp lệ
            }

            // Tính duration trong khoảng hợp lệ
            double validMinutes = (effectiveEnd - effectiveStart) / (1000.0 * 60.0);

            // Trừ break time nếu overlap
            Date start = new Date(effectiveStart);
            Date end = new Date(effectiveEnd);

            double break1Overlap = calculateBreakOverlapForInterval(start, end, 11, 0, 11, 30);
            double break2Overlap = calculateBreakOverlapForInterval(start, end, 18, 0, 18, 30);

            return Math.max(0.0, validMinutes - break1Overlap - break2Overlap);
        }

        private double calculateBreakOverlapForInterval(Date startTime, Date endTime, int breakStartHour, int breakStartMinute, int breakEndHour, int breakEndMinute) {
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

        // New methods for pausing and resuming timer
        //void pauseTimer() {
        //    if (isTimerRunning) {
        //        totalElapsed += System.currentTimeMillis() - lastStartTime;
        //        isTimerRunning = false;
        //        btnToggleTimer.setImageResource(android.R.drawable.ic_media_play);
        //        timerHandler.removeCallbacks(timerRunnable);
        //    }
        //}
        void pauseTimer(long endTime) {
            this.endTime = endTime;  // ← THÊM: Lưu endTime
            if (isTimerRunning) {
                // Tính totalElapsed dựa trên endTime thay vì System.currentTimeMillis()
                totalElapsed += endTime - lastStartTime;
                totalRunningTime += totalElapsed;  // Cộng vào tổng thời gian chạy thực tế
                totalElapsed = 0;  // Reset cho segment tiếp theo
                isTimerRunning = false;
                btnToggleTimer.setImageResource(android.R.drawable.ic_media_play);
                timerHandler.removeCallbacks(timerRunnable);
                // Update display với totalRunningTime mới (đã bao gồm đến endTime)
                long elapsed = totalRunningTime;
                int seconds = (int) (elapsed / 1000) % 60;
                int minutes = (int) ((elapsed / (1000 * 60)) % 60);
                int hours = (int) ((elapsed / (1000 * 60 * 60)) % 24);
                tvRunningTime.setText(String.format("Thời gian chạy: %02d:%02d:%02d", hours, minutes, seconds));
            }
        }

        void stopTimer() {
            if (isTimerRunning) {
                timerHandler.removeCallbacks(timerRunnable);
                isTimerRunning = false;
            }
        }

        //void resumeTimer() {
        //    if (!isTimerRunning) {
        //        lastStartTime = System.currentTimeMillis();
        //        isTimerRunning = true;
        //        btnToggleTimer.setImageResource(android.R.drawable.ic_media_pause);
        //        timerHandler.post(timerRunnable);
        //    }
        //}
        void resumeTimer() {
            if (!isTimerRunning) {
                endTime = 0;  // ← THÊM: Reset endTime khi resume (hủy dialog)
                lastStartTime = System.currentTimeMillis();
                isTimerRunning = true;
                btnToggleTimer.setImageResource(android.R.drawable.ic_media_pause);
                // Thêm interval mới cho resume
                runningIntervals.add(new long[]{lastStartTime, 0});
                timerHandler.post(timerRunnable);
            }
        }

        // ← THÊM updateIncidentInfo() NGAY ĐÂY
        void updateIncidentInfo(String newType, String newProblem, List<String> newSelectedOptions) {
            this.type = newType;
            this.problem = newProblem;
            this.selectedOptions = newSelectedOptions;

            // Cập nhật UI
            if (cardView != null) {
                TextView tvType = cardView.findViewById(R.id.tv_type);
                TextView tvProblem = cardView.findViewById(R.id.tv_problem);

                tvType.setText("Loại: " + newType);

                if (!newProblem.isEmpty()) {
                    tvProblem.setText("Vấn đề: " + newProblem);
                    tvProblem.setVisibility(View.VISIBLE);
                } else {
                    tvProblem.setVisibility(View.GONE);
                }
            }

            // Timer VẪN TIẾP TỤC CHẠY
        }
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

    // 5. SỬA uploadIncidentToServer() cũ - Giữ cho backward compatibility
    private void uploadIncidentToServer(IncidentHistoryEntity entity, long localId) {
        uploadIncidentToServerWithCallback(entity, localId, new UploadCallback() {
            @Override
            public void onSuccess() {
                Log.d("Upload", "Upload server thành công");
            }

            @Override
            public void onFailure(String errorMsg) {
                Log.e("Upload", "Upload server thất bại: " + errorMsg);
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

    // 3. THÊM callback interface
    public interface UploadCallback {
        void onSuccess();
        void onFailure(String errorMsg);
    }

    // 4. THÊM method mới: uploadIncidentToServerWithCallback()
    private void uploadIncidentToServerWithCallback(IncidentHistoryEntity entity, long localId, UploadCallback callback) {
        SharedPreferences prefs = getSharedPreferences("AppPrefs", MODE_PRIVATE);
        String token = prefs.getString("token", null);

        if (token == null) {
            callback.onFailure("Không tìm thấy token xác thực");
            return;
        }

        CreateIncidentRequest incidentRequest = new CreateIncidentRequest();
        incidentRequest.setEquipmentId(entity.getEquipmentId());
        incidentRequest.setLineId(lineId);
        incidentRequest.setStartTime(formatDate(entity.getStartTime()));
        if (entity.getEndTime() != null) {
            incidentRequest.setEndTime(formatDate(entity.getEndTime()));
        }
        //double roundedDuration = Double.parseDouble(String.format("%.2f", entity.getDuration()));
        double roundedDuration = Double.parseDouble(
                String.format(Locale.US, "%.2f", entity.getDuration())
        );
        incidentRequest.setDuration(roundedDuration);
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
        bulkRequest.setIncidents(java.util.Arrays.asList(incidentRequest));

        ApiService apiService = ApiClient.getClient().create(ApiService.class);
        Call<ApiResponse<BulkIncidentResponse>> call = apiService.createBulkIncidents("Bearer " + token, bulkRequest);

        call.enqueue(new Callback<ApiResponse<BulkIncidentResponse>>() {
            @Override
            public void onResponse(Call<ApiResponse<BulkIncidentResponse>> call, Response<ApiResponse<BulkIncidentResponse>> response) {
                try {
                    if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                        BulkIncidentResponse bulkResponse = response.body().getData();
                        if (bulkResponse.getSuccessCount() > 0) {
                            // Server thành công → cập nhật synced status
                            new Thread(() -> {
                                AppDatabase db = AppDatabaseSingleton.getInstance(HomeActivity.this);
                                db.incidentHistoryDao().updateSyncedStatus((int) localId, true);
                                Log.d("Upload", "✓ Cập nhật synced status cho ID=" + localId);
                            }).start();
                            callback.onSuccess();
                        } else {
                            // Server từ chối
                            String errMsg = bulkResponse.getErrors() != null && !bulkResponse.getErrors().isEmpty()
                                    ? bulkResponse.getErrors().get(0).getErrorMessage()
                                    : "Lỗi không xác định";
                            callback.onFailure(errMsg);
                        }
                    } else {
                        callback.onFailure("HTTP " + response.code() + ": " + response.message());
                    }
                } catch (Exception e) {
                    callback.onFailure("Exception: " + e.getMessage());
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<BulkIncidentResponse>> call, Throwable t) {
                callback.onFailure("Network Error: " + t.getMessage());
            }
        });
    }

    // BƯỚC 1: THÊM method kiểm tra xem QR code có phải loại đặc biệt không
    private SpecialQRType checkSpecialQRCode(String qrCode, String lineCode) {
        // Định dạng:
        // - Vệ sinh đầu/cuối ca: "DCC-{LineCode}" ví dụ: "DCC-CK-C02"
        // - Đổi mã: "DM-{LineCode}" ví dụ: "DM-CK-C02"

        if (qrCode == null || lineCode == null) {
            return SpecialQRType.NONE;
        }

        String upperQR = qrCode.toUpperCase().trim();
        String prefix = "DCC-" + lineCode.toUpperCase();

        if (upperQR.equals(prefix)) {
            return SpecialQRType.VE_SINH;
        }

        prefix = "DM-" + lineCode.toUpperCase();
        if (upperQR.equals(prefix)) {
            return SpecialQRType.DOI_MA;
        }

        return SpecialQRType.NONE;
    }

    // BƯỚC 2: THÊM enum để phân loại
    private enum SpecialQRType {
        NONE,           // QR code bình thường (thiết bị)
        VE_SINH,        // QR code "DCC-..." (Vệ sinh đầu/cuối ca)
        DOI_MA          // QR code "DM-..." (Đổi mã)
    }

    // BƯỚC 4: THÊM method xử lý QR code đặc biệt
    private void handleSpecialQRCode(String qrCode, SpecialQRType specialType, String prodLine) {
        String type;
        List<String> selectedOptions;

        if (specialType == SpecialQRType.VE_SINH) {
            type = "Vệ sinh đầu/cuối ca";
        } else {
            type = "Đổi mã";
        }

        if (!deviceCards.containsKey(qrCode)) {
            currentScanTime = System.currentTimeMillis(); // Thời điểm scan lần 1
        }

        // Scan lần 2: Kết thúc
        if (deviceCards.containsKey(qrCode)) {
            currentSecondScanTime = System.currentTimeMillis();
            showStopConfirmationDialog(qrCode);
        } else {
            // Scan lần 1: TẠO CARD NGAY LẬP TỨC + START TIMER (giống device code)
            String startTimeStr = new SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(new Date(currentScanTime));
            DeviceCard card = new DeviceCard(
                    "",
                    "",
                    startTimeStr,
                    type,
                    "", // problem sẽ cập nhật sau khi dialog OK
                    new ArrayList<>(Arrays.asList(type)), // selectedOptions ban đầu chỉ có type
                    null, // equipmentId = null cho special QR
                    new ArrayList<>(), // imagePaths
                    prodLine,
                    currentScanTime
            );
            deviceCards.put(qrCode, card);

            // Sau đó hiển thị dialog để chọn vấn đề (giống device code)
            final String finalType = type;
            SpecialQRInfoDialog infoDialog = new SpecialQRInfoDialog(
                    this,
                    qrCode,
                    prodLine,
                    type,
                    // CHANGED: Updated lambda to accept (selectedIssues, confirmed) parameters
                    (selectedIssues, confirmed) -> {
                        if (!confirmed) {
                            // Dismissed or Close clicked → XÓA CARD và hủy ghi nhận
                            if (deviceCards.containsKey(qrCode)) {
                                DeviceCard cardToRemove = deviceCards.get(qrCode);
                                cardToRemove.stopTimer();
                                llDeviceCardsContainer.removeView(cardToRemove.cardView);
                                deviceCards.remove(qrCode);
                                Toast.makeText(HomeActivity.this, "Đã hủy bỏ ghi nhận", Toast.LENGTH_SHORT).show();
                            }
                        } else {
                            // OK clicked, even with empty issues → CẬP NHẬT thông tin vào card (problem có thể rỗng)
                            String problem = "";
                            for (String issue : selectedIssues) {
                                if (!problem.isEmpty()) problem += ", ";
                                problem += issue;
                            }

                            List<String> allOptions = new ArrayList<>(Arrays.asList(finalType));
                            allOptions.addAll(selectedIssues);

                            card.updateIncidentInfo(finalType, problem, allOptions);
                        }
                    }
            );
            infoDialog.show();
        }
    }

    // BƯỚC 5: THÊM method lấy lineCode từ lineId
    private String getLineCodeFromLineId(int lineId) {
        // Lấy từ Intent hoặc SharedPreferences
        // Bạn có thể lưu lineCode khi login
        SharedPreferences prefs = getSharedPreferences("AppPrefs", MODE_PRIVATE);
        String lineCode = prefs.getString("line_code", "");

        // Nếu không có, try lấy từ equipment list
        if (lineCode.isEmpty() && equipmentList != null && !equipmentList.isEmpty()) {
            // Lấy line code từ equipment đầu tiên (giả định cùng line)
            Equipment firstEquip = equipmentList.get(0);
            if (firstEquip.getLineName() != null) {
                // Parse từ line name nếu cần
                // Hoặc lưu line code trực tiếp từ login response
            }
        }

        return lineCode;
    }
}
