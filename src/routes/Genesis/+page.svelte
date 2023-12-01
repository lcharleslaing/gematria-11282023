<script>
  export let data;
  const { kjvbible, error } = data;
  let groupedByChapter = {};

  // Reactive statement to update groupedByChapter
  $: if (kjvbible && kjvbible.length > 0) {
    groupedByChapter = kjvbible.reduce((acc, record) => {
      const chapterKey = `Chapter ${record.chapter}`;
      if (!acc[chapterKey]) {
        acc[chapterKey] = [];
      }
      acc[chapterKey].push(record);
      return acc;
    }, {});
  }
</script>

<div class="m-2">
  {#each Object.keys(groupedByChapter) as chapterKey}
    <div class="font-bold text-center p-1 bg-primary rounded text-white">
      {chapterKey}
    </div>
    {#each groupedByChapter[chapterKey] as record}
      <div class="flex flex-row">
        <div class="w-1/12">{record.verse}</div>
        <div class="w-11/12">{record.text}</div>
      </div>
    {/each}
  {/each}
</div>
