
// src/app/api/db/seed/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    console.log("Starting database seed process...");

    // Drop tables if they exist to ensure a clean seed (optional, be careful in prod)
    db.exec(`
      DROP TABLE IF EXISTS OrderDetails;
      DROP TABLE IF EXISTS Orders;
      DROP TABLE IF EXISTS Products;
      DROP TABLE IF EXISTS Categories;
      DROP TABLE IF EXISTS Customers;
      DROP TABLE IF EXISTS Suppliers;
      DROP TABLE IF EXISTS saved_queries;
    `);
    console.log("Dropped existing tables (if any).");

    // Create tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS Categories (
        CategoryID INTEGER PRIMARY KEY AUTOINCREMENT,
        CategoryName TEXT NOT NULL,
        Description TEXT
      );

      CREATE TABLE IF NOT EXISTS Suppliers (
        SupplierID INTEGER PRIMARY KEY AUTOINCREMENT,
        SupplierName TEXT NOT NULL,
        ContactName TEXT,
        Country TEXT
      );

      CREATE TABLE IF NOT EXISTS Products (
        ProductID INTEGER PRIMARY KEY AUTOINCREMENT,
        ProductName TEXT NOT NULL,
        SupplierID INTEGER,
        CategoryID INTEGER,
        UnitPrice REAL DEFAULT 0,
        UnitsInStock INTEGER DEFAULT 0,
        Discontinued INTEGER DEFAULT 0, -- 0 for false, 1 for true
        FOREIGN KEY (CategoryID) REFERENCES Categories (CategoryID),
        FOREIGN KEY (SupplierID) REFERENCES Suppliers (SupplierID)
      );

      CREATE TABLE IF NOT EXISTS Customers (
        CustomerID TEXT PRIMARY KEY, -- Using TEXT for common practice like 'ALFKI'
        CustomerName TEXT NOT NULL,
        ContactName TEXT,
        City TEXT,
        Country TEXT,
        RegistrationDate DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS Orders (
        OrderID INTEGER PRIMARY KEY AUTOINCREMENT,
        CustomerID TEXT,
        OrderDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        ShipDate DATETIME,
        ShipCity TEXT,
        TotalAmount REAL,
        FOREIGN KEY (CustomerID) REFERENCES Customers (CustomerID)
      );

      CREATE TABLE IF NOT EXISTS OrderDetails (
        OrderDetailID INTEGER PRIMARY KEY AUTOINCREMENT,
        OrderID INTEGER NOT NULL,
        ProductID INTEGER NOT NULL,
        Quantity INTEGER DEFAULT 1,
        UnitPrice REAL,
        Discount REAL DEFAULT 0,
        FOREIGN KEY (OrderID) REFERENCES Orders (OrderID),
        FOREIGN KEY (ProductID) REFERENCES Products (ProductID)
      );

      CREATE TABLE IF NOT EXISTS saved_queries (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        sql TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Tables created successfully.");

    // Seed data
    const insertCategory = db.prepare('INSERT INTO Categories (CategoryName, Description) VALUES (?, ?)');
    const insertSupplier = db.prepare('INSERT INTO Suppliers (SupplierName, ContactName, Country) VALUES (?, ?, ?)');
    const insertProduct = db.prepare('INSERT INTO Products (ProductName, SupplierID, CategoryID, UnitPrice, UnitsInStock, Discontinued) VALUES (?, ?, ?, ?, ?, ?)');
    const insertCustomer = db.prepare('INSERT INTO Customers (CustomerID, CustomerName, ContactName, City, Country) VALUES (?, ?, ?, ?, ?)');
    const insertOrder = db.prepare('INSERT INTO Orders (CustomerID, OrderDate, ShipCity, TotalAmount) VALUES (?, ?, ?, ?)');
    const insertOrderDetail = db.prepare('INSERT INTO OrderDetails (OrderID, ProductID, Quantity, UnitPrice, Discount) VALUES (?, ?, ?, ?, ?)');

    // Batch inserts in a transaction for performance
    db.transaction(() => {
      // Categories
      const cat1 = insertCategory.run('Beverages', 'Soft drinks, coffees, teas, beers, and ales');
      const cat2 = insertCategory.run('Condiments', 'Sweet and savory sauces, relishes, spreads, and seasonings');
      const cat3 = insertCategory.run('Confections', 'Desserts, candies, and sweet breads');
      const cat4 = insertCategory.run('Dairy Products', 'Cheeses');
      const cat5 = insertCategory.run('Produce', 'Dried fruit and bean curd');
      const cat6 = insertCategory.run('Meat/Poultry', 'Prepared meats');
      const cat7 = insertCategory.run('Seafood', 'Seaweed and fish');


      // Suppliers
      const sup1 = insertSupplier.run('Exotic Liquids', 'Charlotte Cooper', 'UK');
      const sup2 = insertSupplier.run('New Orleans Cajun Delights', 'Shelley Burke', 'USA');
      const sup3 = insertSupplier.run('Tokyo Traders', 'Yoshi Nagase', 'Japan');

      // Products
      insertProduct.run('Chai', sup1.lastInsertRowid, cat1.lastInsertRowid, 18.00, 39, 0);
      insertProduct.run('Chang', sup1.lastInsertRowid, cat1.lastInsertRowid, 19.00, 17, 0);
      insertProduct.run('Aniseed Syrup', sup1.lastInsertRowid, cat2.lastInsertRowid, 10.00, 13, 0);
      insertProduct.run('Chef Anton\'s Cajun Seasoning', sup2.lastInsertRowid, cat2.lastInsertRowid, 22.00, 53, 0);
      insertProduct.run('Mishi Kobe Niku', sup3.lastInsertRowid, cat6.lastInsertRowid, 97.00, 29, 1); // Discontinued
      insertProduct.run('Ikura', sup3.lastInsertRowid, cat7.lastInsertRowid, 31.00, 31, 0);


      // Customers
      insertCustomer.run('ALFKI', 'Alfreds Futterkiste', 'Maria Anders', 'Berlin', 'Germany');
      insertCustomer.run('ANATR', 'Ana Trujillo Emparedados y helados', 'Ana Trujillo', 'México D.F.', 'Mexico');
      insertCustomer.run('ANTON', 'Antonio Moreno Taquería', 'Antonio Moreno', 'México D.F.', 'Mexico');

      // Orders & OrderDetails
      const order1 = insertOrder.run('ALFKI', '2024-01-15 10:30:00', 'Berlin', 150.50);
      insertOrderDetail.run(order1.lastInsertRowid, 1, 10, 18.00, 0); // Chai
      insertOrderDetail.run(order1.lastInsertRowid, 2, 5, 19.00, 0.05); // Chang with discount

      const order2 = insertOrder.run('ANATR', '2024-02-20 14:00:00', 'México D.F.', 88.80);
      insertOrderDetail.run(order2.lastInsertRowid, 4, 2, 22.00, 0); // Cajun Seasoning
      insertOrderDetail.run(order2.lastInsertRowid, 6, 3, 31.00, 0.1); // Ikura with discount
      
      console.log("Sample data inserted.");
    })();
    
    return NextResponse.json({ message: "Database seeded successfully with SQLite." }, { status: 200 });
  } catch (error: any) {
    console.error("Error seeding SQLite database:", error);
    return NextResponse.json({ message: "Error seeding SQLite database", error: error.message }, { status: 500 });
  }
}
