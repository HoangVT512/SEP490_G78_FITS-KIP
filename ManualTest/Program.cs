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
                case "5":
                    await RunProductionOutputServiceTests();
                    break;
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
        Console.WriteLine("5. Production Output Service Tests");
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

}