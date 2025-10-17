package com.example.fitsforkip.ui.login;

import android.content.Intent;
import android.os.Bundle;

import com.example.fitsforkip.ui.home.HomeActivity;
import com.google.android.material.button.MaterialButton;

import androidx.appcompat.app.AppCompatActivity;

import android.text.Editable;
import android.text.TextWatcher;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.Toast;

import com.example.fitsforkip.R;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;

import java.util.ArrayList;
import java.util.List;

public class LoginActivity extends AppCompatActivity {

    private TextInputLayout tilEmployeeId;
    private TextInputEditText etEmployeeId;
    private TextInputLayout tilProductionLine;
    private AutoCompleteTextView actvProductionLine;
    private MaterialButton btnLogin;

    private List<String> productionLines;
    private ArrayAdapter<String> productionLineAdapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        initViews();
        setupProductionLineData();
        setupListeners();
    }

    private void initViews() {
        tilEmployeeId = findViewById(R.id.til_employee_id);
        etEmployeeId = findViewById(R.id.et_employee_id);
        tilProductionLine = findViewById(R.id.til_production_line);
        actvProductionLine = findViewById(R.id.actv_production_line);
        btnLogin = findViewById(R.id.btn_login);
    }

    private void setupProductionLineData() {
        // Dữ liệu mẫu các dây chuyền sản xuất
        productionLines = new ArrayList<>();
        productionLines.add("Dây chuyền 1 - Lắp ráp");
        productionLines.add("Dây chuyền 2 - Hàn");
        productionLines.add("Dây chuyền 3 - Sơn");
        productionLines.add("Dây chuyền 4 - Đóng gói");
        productionLines.add("Dây chuyền 5 - Kiểm tra chất lượng");
        productionLines.add("Dây chuyền 6 - Gia công cơ khí");

        // Setup adapter cho AutoCompleteTextView
        productionLineAdapter = new ArrayAdapter<>(
                this,
                android.R.layout.simple_dropdown_item_1line,
                productionLines
        );
        actvProductionLine.setAdapter(productionLineAdapter);
    }

    private void setupListeners() {
        // Clear button cho Production Line
        tilProductionLine.setEndIconOnClickListener(v -> {
            actvProductionLine.setText("");
            actvProductionLine.clearFocus();
        });

        // Validation khi nhập Employee ID
        etEmployeeId.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                if (tilEmployeeId.isErrorEnabled()) {
                    tilEmployeeId.setError(null);
                    tilEmployeeId.setErrorEnabled(false);
                }
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });

        // Validation khi chọn Production Line
        actvProductionLine.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                if (tilProductionLine.isErrorEnabled()) {
                    tilProductionLine.setError(null);
                    tilProductionLine.setErrorEnabled(false);
                }
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });

        // Login button click
        btnLogin.setOnClickListener(v -> handleLogin());
    }

    private void handleLogin() {
        String employeeId = etEmployeeId.getText().toString().trim();
        String productionLine = actvProductionLine.getText().toString().trim();

        // Validation
        boolean isValid = true;

        if (employeeId.isEmpty()) {
            tilEmployeeId.setError("Vui lòng nhập mã nhân viên");
            tilEmployeeId.setErrorEnabled(true);
            isValid = false;
        }

        if (productionLine.isEmpty()) {
            tilProductionLine.setError("Vui lòng chọn dây chuyền");
            tilProductionLine.setErrorEnabled(true);
            isValid = false;
        } else if (!productionLines.contains(productionLine)) {
            tilProductionLine.setError("Dây chuyền không hợp lệ");
            tilProductionLine.setErrorEnabled(true);
            isValid = false;
        }

        if (isValid) {
            // Hiển thị loading (có thể thêm ProgressBar)
            btnLogin.setEnabled(false);
            btnLogin.setText("Đang đăng nhập...");

            // TODO: Gọi API login thông qua ViewModel
            // Giả lập đăng nhập thành công sau 1.5s
            btnLogin.postDelayed(() -> {
                // Lưu thông tin đăng nhập (SharedPreferences)
                saveLoginInfo(employeeId, productionLine);

                // Chuyển đến HomeActivity
                Intent intent = new Intent(LoginActivity.this, HomeActivity.class);
                intent.putExtra("employee_id", employeeId);
                intent.putExtra("production_line", productionLine);
                startActivity(intent);
                finish();

                Toast.makeText(this, "Đăng nhập thành công!", Toast.LENGTH_SHORT).show();
            }, 1500);
        }
    }

    private void saveLoginInfo(String employeeId, String productionLine) {
        // TODO: Lưu vào SharedPreferences hoặc Room Database
        getSharedPreferences("AppPrefs", MODE_PRIVATE)
                .edit()
                .putString("employee_id", employeeId)
                .putString("production_line", productionLine)
                .putBoolean("is_logged_in", true)
                .apply();
    }
}