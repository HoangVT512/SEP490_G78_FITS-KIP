package com.example.fitsforkip.ui.login;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;

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

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import com.example.fitsforkip.data.remote.ApiClient;
import com.example.fitsforkip.data.remote.ApiService;
import com.example.fitsforkip.data.model.ApiResponse;
import com.example.fitsforkip.data.model.Line;
import com.example.fitsforkip.data.model.UserDTO;
import com.example.fitsforkip.data.model.MobileLoginRequest;
import com.example.fitsforkip.data.model.MobileLoginResponse;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

public class LoginActivity extends AppCompatActivity {

    private TextInputLayout tilEmployeeId;
    private TextInputEditText etEmployeeId;
    private TextInputLayout tilProductionLine;
    private AutoCompleteTextView actvProductionLine;
    private MaterialButton btnLogin;

    private List<String> productionLines;
    private List<Line> linesList;
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
        // Remove password views if they exist
        // tilPassword = findViewById(R.id.til_password);
        // etPassword = findViewById(R.id.et_password);
    }

    private void setupProductionLineData() {
        // Fetch production lines from API
        ApiService apiService = ApiClient.getClient().create(ApiService.class);
        Call<ApiResponse<List<Line>>> call = apiService.getAllLines();
        call.enqueue(new Callback<ApiResponse<List<Line>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Line>>> call, Response<ApiResponse<List<Line>>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    List<Line> lines = response.body().getData();
                    productionLines = new ArrayList<>();
                    linesList = lines; // Save the full Line objects
                    for (Line line : lines) {
                        productionLines.add(line.getName());
                    }
                    productionLineAdapter = new ArrayAdapter<>(
                            LoginActivity.this,
                            android.R.layout.simple_dropdown_item_1line,
                            productionLines
                    );
                    actvProductionLine.setAdapter(productionLineAdapter);
                } else {
                    Log.e("LoginActivity", "API response not successful: " + response.code() + " " + response.message());
                    Toast.makeText(LoginActivity.this, "Không thể tải danh sách dây chuyền", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Line>>> call, Throwable t) {
                Log.e("LoginActivity", "API call failed", t);
                Toast.makeText(LoginActivity.this, "Lỗi: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
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
            // Hiển thị loading
            btnLogin.setEnabled(false);
            btnLogin.setText("Đang đăng nhập...");

            // Find the selected line
            Line selectedLine = null;
            for (Line line : linesList) {
                if (line.getName().equals(productionLine)) {
                    selectedLine = line;
                    break;
                }
            }

            if (selectedLine != null) {
                // Create login request
                MobileLoginRequest request = new MobileLoginRequest(employeeId, selectedLine.getLineId());

                // Call API
                ApiService apiService = ApiClient.getClient().create(ApiService.class);
                Call<ApiResponse<MobileLoginResponse>> call = apiService.mobileLogin(request);
                call.enqueue(new Callback<ApiResponse<MobileLoginResponse>>() {
                    @Override
                    public void onResponse(Call<ApiResponse<MobileLoginResponse>> call, Response<ApiResponse<MobileLoginResponse>> response) {
                        // Reset button
                        btnLogin.setEnabled(true);
                        btnLogin.setText("Đăng nhập");

                        if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                            MobileLoginResponse loginResponse = response.body().getData();
                            // Save token, user, line to SharedPreferences
                            SharedPreferences prefs = getSharedPreferences("AppPrefs", MODE_PRIVATE);
                            SharedPreferences.Editor editor = prefs.edit();
                            editor.putString("token", loginResponse.getToken());
                            editor.putString("user_id", loginResponse.getUser().getId());
                            editor.putString("employee_id", loginResponse.getUser().getEmployeeCode());
                            editor.putString("production_line", loginResponse.getLine().getLineName());
                            editor.putString("line_code", loginResponse.getLine().getLineCode());
                            editor.putInt("line_id", loginResponse.getLine().getLineId());
                            editor.commit();

                            // Navigate to HomeActivity
                            Intent intent = new Intent(LoginActivity.this, HomeActivity.class);
                            intent.putExtra("user", loginResponse.getUser());
                            intent.putExtra("line", loginResponse.getLine());
                            startActivity(intent);
                            finish();
                        } else {
                            String message = "Đăng nhập thất bại";
                            if (response.body() != null && response.body().getMessage() != null) {
                                message = response.body().getMessage();
                            } else if (response.errorBody() != null) {
                                try (okhttp3.ResponseBody errorBody = response.errorBody()) {
                                    String errorString = errorBody.string();
                                    try {
                                        ApiResponse<MobileLoginResponse> errorResponse = new Gson().fromJson(errorString, new TypeToken<ApiResponse<MobileLoginResponse>>(){}.getType());
                                        if (errorResponse != null && errorResponse.getMessage() != null) {
                                            message = errorResponse.getMessage();
                                        }
                                    } catch (Exception e) {
                                        // If not JSON, use the string directly
                                        message = errorString;
                                    }
                                } catch (Exception e) {
                                    Log.e("LoginActivity", "Error reading error body", e);
                                }
                            }
                            Toast.makeText(LoginActivity.this, message, Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<ApiResponse<MobileLoginResponse>> call, Throwable t) {
                        // Reset button
                        btnLogin.setEnabled(true);
                        btnLogin.setText("Đăng nhập");

                        Toast.makeText(LoginActivity.this, "Lỗi: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                    }
                });
            } else {
                // Reset button
                btnLogin.setEnabled(true);
                btnLogin.setText("Đăng nhập");
                Toast.makeText(LoginActivity.this, "Không tìm thấy dây chuyền", Toast.LENGTH_SHORT).show();
            }
        }
    }
}