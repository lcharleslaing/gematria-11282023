<script>
  import { goto } from "$app/navigation";
  const OTbooksOfBible = [
    "Genesis",
    "Exodus",
    "Leviticus",
    "Numbers",
    "Deuteronomy",
    "Joshua",
    "Judges",
    "Ruth",
    "1 Samuel",
    "2 Samuel",
    "1 Kings",
    "2 Kings",
    "1 Chronicles",
    "2 Chronicles",
    "Ezra",
    "Nehemiah",
    "Esther",
    "Job",
    "Psalms",
    "Proverbs",
    "Ecclesiastes",
    "Song of Solomon",
    "Isaiah",
    "Jeremiah",
    "Lamentations",
    "Ezekiel",
    "Daniel",
    "Hosea",
    "Joel",
    "Amos",
    "Obadiah",
    "Jonah",
    "Micah",
    "Nahum",
    "Habakkuk",
    "Zephaniah",
    "Haggai",
    "Zechariah",
    "Malachi",
  ];
  const NTbooksOfBible = [
    "Matthew",
    "Mark",
    "Luke",
    "John",
    "Acts",
    "Romans",
    "1 Corinthians",
    "2 Corinthians",
    "Galatians",
    "Ephesians",
    "Philippians",
    "Colossians",
    "1 Thessalonians",
    "2 Thessalonians",
    "1 Timothy",
    "2 Timothy",
    "Titus",
    "Philemon",
    "Hebrews",
    "James",
    "1 Peter",
    "2 Peter",
    "1 John",
    "2 John",
    "3 John",
    "Jude",
    "Revelation",
  ];

  function navigateToBook(book) {
    goto(`/${book}`);
  }
</script>

<h1 class="text-center text-2xl">Old Testament</h1>

<div class="m-2">
  <div class=" grid grid-cols-3 gap-1">
    {#each OTbooksOfBible as book}
      <a
        href="/{book}"
        class="p-2 border rounded"
        on:click={() => navigateToBook(book)}
      >
        {book}
      </a>
    {/each}
  </div>

  <h1 class="text-center text-2xl">New Testament</h1>
  <div class="grid grid-cols-3 gap-1">
    {#each NTbooksOfBible as book}
      <a
        href="/{book}"
        class="p-2 border rounded"
        on:click={() => navigateToBook(book)}
      >
        {book}
      </a>
    {/each}
  </div>
</div>
