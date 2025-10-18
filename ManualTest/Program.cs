using FITSKIP.Application.Tests.ManualTests;

namespace FITSKIP.Application.Tests.ManualTests;

class Program
{
    static async Task Main(string[] args)
    {
        Console.WriteLine("🧪 MANUAL SERVICE TEST RUNNER");
        Console.WriteLine("==============================");
        Console.WriteLine("Chọn loại test để chạy:");
        Console.WriteLine();

        while (true)
        {
            ShowMainMenu();
            var choice = Console.ReadLine();

            switch (choice)
            {
                case "1":
                    await RunDepartmentServiceTests();
                    break;
                case "2":
                    await RunAllServicesTests();
                    break;
                case "0":
                    Console.WriteLine("👋 Goodbye!");
                    return;
                default:
                    Console.WriteLine("❌ Invalid choice. Please try again.");
                    break;
            }

            Console.WriteLine("\nPress any key to continue...");
            Console.ReadKey();
            Console.Clear();
        }
    }

    static void ShowMainMenu()
    {
        Console.WriteLine("📋 MAIN TEST MENU");
        Console.WriteLine("=================");
        Console.WriteLine("1. Department Service Tests");
        Console.WriteLine("2. Run All Services Tests");
        Console.WriteLine("0. Exit");
        Console.WriteLine();
        Console.Write("Enter your choice: ");
    }

    static async Task RunDepartmentServiceTests()
    {
        Console.WriteLine("\n🏢 DEPARTMENT SERVICE TESTS");
        Console.WriteLine("===========================");
        Console.WriteLine("Chọn loại test:");
        Console.WriteLine("1. Interactive Tests (Nhập dữ liệu thủ công)");
        Console.WriteLine("2. Automatic Tests (Chạy tất cả tests)");
        Console.WriteLine("0. Back to Main Menu");
        Console.WriteLine();
        Console.Write("Enter your choice: ");

        var choice = Console.ReadLine();

        var testRunner = new DepartmentServiceManualTest();

        switch (choice)
        {
            case "1":
                await testRunner.RunInteractiveTests();
                break;
            case "2":
                await testRunner.RunAllTests();
                break;
            case "0":
                return;
            default:
                Console.WriteLine("❌ Invalid choice. Running interactive tests...");
                await testRunner.RunInteractiveTests();
                break;
        }
    }

    static async Task RunAllServicesTests()
    {
        Console.WriteLine("\n🚀 RUNNING ALL SERVICES TESTS");
        Console.WriteLine("=============================");
        
        var departmentTest = new DepartmentServiceManualTest();
        
        Console.WriteLine("Running Department Service Tests...");
        await departmentTest.RunAllTests();
        
        Console.WriteLine("\n✅ All service tests completed!");
        Console.WriteLine("Note: Other services will be implemented in future updates.");
    }
}