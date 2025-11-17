using FITSKIP.Application.Tests.ManualTests;

namespace FITSKIP.Application.Tests.ManualTests;

class Program
{
    static async Task Main(string[] args)
    {
        Console.WriteLine("MANUAL SERVICE TEST RUNNER");
        Console.WriteLine("===========================");
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
                    await RunEquimentServiceTests();
                    break;
                case "3":
                    await RunPurchaseRequestServiceTests();
                    break;
                case "4":
                    await RunIncidentServiceTests();
                    break;
                case "5":
                    await RunProductionOutputServiceTests();
                    break;
                case "6":
                    await RunLineServiceTests();
                    break;
                case "7":
                    await RunUserServiceTests();
                    break;
                case "8":
                    await RunStageServiceTests();
                    break;
                case "9":
                    await RunSparePartServiceTests();
                    break;
/*                case "10":
                    await RunReplacementHistoryServiceTests();
                    break;*/
                case "11":
                    await RunNotificationServiceTests();
                    break;
/*                case "12":
                    await RunDashboardServiceTests();
                    break;*/
                case "0":
                    Console.WriteLine("Goodbye!");
                    return;
                default:
                    Console.WriteLine("Invalid choice. Please try again.");
                    break;
            }

            Console.WriteLine("\nPress any key to continue...");
            Console.ReadKey();
            Console.Clear();
        }
    }

    static void ShowMainMenu()
    {
        Console.WriteLine("MAIN TEST MENU");
        Console.WriteLine("===============");
        Console.WriteLine("1. Department Service Tests");
        Console.WriteLine("2. Equiment Service Tests");
        Console.WriteLine("3. Purchase Request Service Tests");
        Console.WriteLine("4. Incident Service Tests");
        Console.WriteLine("5. Production Output Service Tests");
        Console.WriteLine("6. Line Service Tests");
        Console.WriteLine("7. User Service Tests");
        Console.WriteLine("8. Stage Service Tests");
        Console.WriteLine("9. Spare Part Service Tests");
        Console.WriteLine("10. Replacement History Service Tests");
        Console.WriteLine("11. Notification Service Tests");
        Console.WriteLine("12. Dashboard Service Tests");
        Console.WriteLine("0. Exit");
        Console.WriteLine();
        Console.Write("Enter your choice: ");
    }

    static async Task RunDepartmentServiceTests()
    {

        var testRunner = new DepartmentServiceManualTest();
        await testRunner.RunTests();
    }

    static async Task RunEquimentServiceTests()
    {

        var testRunner = new EquipmentServiceManualTest();
        await testRunner.RunTests();
    }

    static async Task RunPurchaseRequestServiceTests()
    {

        var testRunner = new PurchaseRequestServiceManualTest();
        await testRunner.RunTests();
    }

    static async Task RunIncidentServiceTests()
    {

        var testRunner = new IncidentServiceManualTest();
        await testRunner.RunTests();
    }

/*    static async Task RunAuthServiceTests()
    {

        var testRunner = new AuthServiceManualTest();
        await testRunner.RunTests();
    }*/

    static async Task RunProductionOutputServiceTests()
    {

        var testRunner = new ProductionOutputServiceManualTest();
        await testRunner.RunTests();
    }

    static async Task RunLineServiceTests()
    {

        var testRunner = new LineServiceManualTest();
        await testRunner.RunTests();
    }

    static async Task RunUserServiceTests()
    {

        var testRunner = new UserServiceManualTest();
        await testRunner.RunTests();
    }

    static async Task RunStageServiceTests()
    {

        var testRunner = new StageServiceManualTest();
        await testRunner.RunTests();
    }

    static async Task RunSparePartServiceTests()
    {

        var testRunner = new SparePartServiceManualTest();
        await testRunner.RunTests();
    }

    //static async Task RunReplacementHistoryServiceTests()
    //{

    //    var testRunner = new ReplacementHistoryServiceManualTest();
    //    await testRunner.RunTests();
    //}

    static async Task RunNotificationServiceTests()
    {

        var testRunner = new NotificationServiceManualTest();
        await testRunner.RunTests();
    }

/*    static async Task RunDashboardServiceTests()
    {

        var testRunner = new DashboardServiceManualTest();
        await testRunner.RunTests();
    }*/

}