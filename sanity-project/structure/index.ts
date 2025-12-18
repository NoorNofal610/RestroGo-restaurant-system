import { StructureBuilder } from 'sanity/desk';

export default (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      // ============================
      // 📂 Blog Section
      // ============================
      S.listItem()
        .title('Blog')
        .child(
          S.list()
            .title('Blog Content')
            .items([
              S.documentTypeListItem('author').title('Authors'),
            ])
        ),

      // ============================
      // 📂 E-Commerce Section
      // ============================
      S.listItem()
        .title('E-Commerce')
        .child(
          S.list()
            .title('E-Commerce Content')
            .items([
            //   S.documentTypeListItem('product').title('Products'),
            ])
        ),

      // ============================
      // 📂 Site Settings
      // ============================
      S.listItem()
        .title('Site Settings')
        .child(
          S.list()
            .title('Settings')
            // .items([
            //   S.listItem()
            //     .title('Home Page')
            //     .child(
            //       S.editor()
            //         .id('homePage')
            //         .schemaType('homePage')
            //         .documentId('homePage')
            //     ),

            //   S.listItem()
            //     .title('Navigation')
            //     .child(
            //       S.editor()
            //         .id('navigation')
            //         .schemaType('navigation')
            //         .documentId('navigation')
            //     ),

            //   S.listItem()
            //     .title('Footer')
            //     .child(
            //       S.editor()
            //         .id('footer')
            //         .schemaType('footer')
            //         .documentId('footer')
            //     ),
            // ])
        ),

    //   // Optional: باقي السكيمات غير المذكورة
    //   ...S.documentTypeListItems().filter(
    //     (item) =>
    //       ![
    //         'post',
    //         'category',
    //         'author',
    //         'product',
    //         'homePage',
    //         'navigation',
    //         'footer',
    //       ].includes(item.getId())
    //   ),
    ]);
