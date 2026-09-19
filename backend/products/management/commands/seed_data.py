from decimal import Decimal
from django.core.management.base import BaseCommand
from products.models import Category, Product


class Command(BaseCommand):
    help = 'Seeds initial realistic categories and products for the local shop e-commerce platform.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding categories and products..."))

        categories_data = [
            {
                'name': 'Artisanal Ceramics & Decor',
                'description': 'Handcrafted pottery, ceramic mugs, glazed bowls, and home accents crafted by regional artisans.',
            },
            {
                'name': 'Handloom Textiles & Living',
                'description': 'Natural cotton throws, linen cushions, handwoven napkins, and sustainable everyday textiles.',
            },
            {
                'name': 'Organic Pantry & Spices',
                'description': 'Directly sourced wild honey, stone-ground indigenous spices, single-origin teas, and cold-pressed oils.',
            },
            {
                'name': 'Botanical Personal Care',
                'description': 'Small-batch cold process soaps, botanical bath salts, whipped shea butter, and natural lip balms.',
            },
        ]

        categories_map = {}
        for cat_info in categories_data:
            cat, created = Category.objects.update_or_create(
                name=cat_info['name'],
                defaults={'description': cat_info['description']}
            )
            categories_map[cat.name] = cat
            status_text = "Created" if created else "Updated"
            self.stdout.write(f"  {status_text} Category: {cat.name}")

        products_data = [
            # Ceramics
            {
                'category': 'Artisanal Ceramics & Decor',
                'name': 'Hand-Glazed Terracotta Tea Mug',
                'description': 'Hand-thrown stoneware mug with a rustic matte speckle finish. Holds 320ml, microwave & dishwasher safe.',
                'price': Decimal('449.00'),
                'stock': 24,
                'is_featured': True,
                'image_url': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
            },
            {
                'category': 'Artisanal Ceramics & Decor',
                'name': 'Minimalist Speckled Pasta Bowl',
                'description': 'Wide, shallow artisan ceramic bowl with an earthy rim. Ideal for pasta, salads, and grain bowls.',
                'price': Decimal('699.00'),
                'stock': 16,
                'is_featured': True,
                'image_url': 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
            },
            {
                'category': 'Artisanal Ceramics & Decor',
                'name': 'Sculptural Ceramic Bud Vase',
                'description': 'Fluted organic clay vase finished in off-white glaze. Crafted to hold single blooms or dried florals.',
                'price': Decimal('899.00'),
                'stock': 9,
                'is_featured': False,
                'image_url': 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=800&q=80',
            },
            {
                'category': 'Artisanal Ceramics & Decor',
                'name': 'Handmade Pour-Over Coffee Dripper',
                'description': 'Precision-grooved stoneware coffee dripper for slow brew enthusiasts. Fits standard #2 filters.',
                'price': Decimal('749.00'),
                'stock': 12,
                'is_featured': False,
                'image_url': 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
            },

            # Textiles
            {
                'category': 'Handloom Textiles & Living',
                'name': 'Waffle-Weave Organic Cotton Throw',
                'description': 'Ultra-soft pure breathable cotton blanket woven on traditional wooden looms. Dimensions: 130cm x 170cm.',
                'price': Decimal('1499.00'),
                'stock': 14,
                'is_featured': True,
                'image_url': 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
            },
            {
                'category': 'Handloom Textiles & Living',
                'name': 'Natural Washed Linen Cushion Cover',
                'description': 'Earth-toned 100% European flax linen cushion cover with concealed metal zipper. Size: 45cm x 45cm.',
                'price': Decimal('599.00'),
                'stock': 22,
                'is_featured': False,
                'image_url': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
            },
            {
                'category': 'Handloom Textiles & Living',
                'name': 'Hand-Block Printed Dining Napkins (Set of 4)',
                'description': 'Printed with non-toxic vegetable dyes on crisp unbleached cotton. Machine washable.',
                'price': Decimal('499.00'),
                'stock': 18,
                'is_featured': False,
                'image_url': 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80',
            },

            # Pantry & Spices
            {
                'category': 'Organic Pantry & Spices',
                'name': 'Raw Forest Wildflower Honey (350g)',
                'description': 'Unprocessed, unfiltered multi-flora honey harvested sustainably from deep deciduous forest reserves.',
                'price': Decimal('389.00'),
                'stock': 30,
                'is_featured': True,
                'image_url': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
            },
            {
                'category': 'Organic Pantry & Spices',
                'name': 'Stone-Ground Malabar Black Peppercorns (150g)',
                'description': 'Sun-dried Tellicherry grade pepper boasting bold aroma and intense fruity warmth.',
                'price': Decimal('249.00'),
                'stock': 40,
                'is_featured': False,
                'image_url': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
            },
            {
                'category': 'Organic Pantry & Spices',
                'name': 'Single-Estate Himalayan Green Tea (100g)',
                'description': 'Whole leaf loose green tea plucked at 6,000 ft altitude. Subtle notes of sweet grass and toasted pine.',
                'price': Decimal('349.00'),
                'stock': 25,
                'is_featured': True,
                'image_url': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
            },
            {
                'category': 'Organic Pantry & Spices',
                'name': 'Cold-Pressed Golden Mustard Oil (500ml)',
                'description': 'Pure unrefined wood-pressed kachi ghani mustard oil retaining all natural micronutrients.',
                'price': Decimal('210.00'),
                'stock': 20,
                'is_featured': False,
                'image_url': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
            },

            # Botanical Care
            {
                'category': 'Botanical Personal Care',
                'name': 'Cold-Processed Lavender & Oat Soap Bar',
                'description': 'Gentle saponified olive and coconut oil soap enriched with colloidal oatmeal and Bulgarian lavender.',
                'price': Decimal('199.00'),
                'stock': 35,
                'is_featured': True,
                'image_url': 'https://images.unsplash.com/photo-1607006314144-88484fe98c46?auto=format&fit=crop&w=800&q=80',
            },
            {
                'category': 'Botanical Personal Care',
                'name': 'Whipped Shea & Bergamot Body Butter (120g)',
                'description': 'Deeply hydrating raw African shea butter whipped with golden jojoba oil and uplifting bergamot peel oil.',
                'price': Decimal('549.00'),
                'stock': 15,
                'is_featured': False,
                'image_url': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
            },
            {
                'category': 'Botanical Personal Care',
                'name': 'Pink Himalayan Mineral Bath Soak (300g)',
                'description': 'Therapeutic bath soak blended with Epsom salts, dried rose petals, and eucalyptus essential oil.',
                'price': Decimal('420.00'),
                'stock': 10,
                'is_featured': False,
                'image_url': 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80',
            },
            {
                'category': 'Botanical Personal Care',
                'name': 'Sandalwood & Vetiver Lip Treatment',
                'description': 'Intensive restorative balm made with pure beeswax, raw cocoa butter, and comforting vetiver.',
                'price': Decimal('179.00'),
                'stock': 0, # Intentionally 0 stock to demonstrate out-of-stock badge
                'is_featured': False,
                'image_url': 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=800&q=80',
            },
        ]

        for p_info in products_data:
            cat = categories_map[p_info['category']]
            prod, created = Product.objects.update_or_create(
                name=p_info['name'],
                defaults={
                    'category': cat,
                    'description': p_info['description'],
                    'price': p_info['price'],
                    'stock': p_info['stock'],
                    'is_featured': p_info['is_featured'],
                    'image_url': p_info['image_url'],
                    'is_active': True,
                }
            )
            status_text = "Created" if created else "Updated"
            self.stdout.write(f"  {status_text} Product: {prod.name} (₹{prod.price}) - Stock: {prod.stock}")

        self.stdout.write(self.style.SUCCESS(
            f"Successfully seeded {len(categories_data)} categories and {len(products_data)} products!"
        ))
