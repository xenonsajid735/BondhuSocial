
const postForm = document.getElementById("postForm");
const postText = document.getElementById("postText");
const postsContainer = document.getElementById("posts");
const searchInput = document.getElementById("search");
const pageTitle = document.getElementById("pageTitle");

let posts = [];

try {
  posts = JSON.parse(localStorage.getItem("bondhuPosts") || "[]");
  if (!Array.isArray(posts)) posts = [];
} catch {
  posts = [];
}

function savePosts() {
  localStorage.setItem("bondhuPosts", JSON.stringify(posts));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function renderPosts() {
  const search = searchInput.value.trim().toLowerCase();

  const visiblePosts = posts.filter(post =>
    post.text.toLowerCase().includes(search)
  );

  if (visiblePosts.length === 0) {
    postsContainer.innerHTML =
      '<div class="empty">No posts yet. Be the first to post!</div>';
    return;
  }

  postsContainer.innerHTML = visiblePosts.map(post => `
    <article class="post">
      <div class="post-header">
        <div class="avatar">B</div>
        <div>
          <div class="post-name">Bondhu User</div>
          <div class="post-time">${escapeHTML(post.time)}</div>
        </div>
      </div>

      <div class="post-content">${escapeHTML(post.text)}</div>

      <div class="post-actions">
        <button class="${post.liked ? "liked" : ""}"
          data-action="like" data-id="${post.id}">
          ${post.liked ? "❤️ Liked" : "🤍 Like"} (${post.likes})
        </button>
        <button data-action="focus-comment" data-id="${post.id}">
          💬 Comments (${post.comments.length})
        </button>
      </div>

      <div class="comments">
        ${post.comments.map(comment =>
          `<div class="comment">${escapeHTML(comment)}</div>`
        ).join("")}
      </div>

      <form class="comment-area" data-id="${post.id}">
        <input name="comment" maxlength="300"
          placeholder="Write a comment..." required>
        <button class="primary" type="submit">Send</button>
      </form>
    </article>
  `).join("");
}

postForm.addEventListener("submit", event => {
  event.preventDefault();

  const text = postText.value.trim();
  if (!text) return;

  posts.unshift({
    id: Date.now() + Math.random(),
    text,
    time: new Date().toLocaleString(),
    likes: 0,
    liked: false,
    comments: []
  });

  savePosts();
  postText.value = "";
  renderPosts();
});

postsContainer.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const post = posts.find(item =>
    String(item.id) === button.dataset.id
  );
  if (!post) return;

  if (button.dataset.action === "like") {
    post.liked = !post.liked;
    post.likes = Math.max(0, post.likes + (post.liked ? 1 : -1));
    savePosts();
    renderPosts();
  }

  if (button.dataset.action === "focus-comment") {
    const form = postsContainer.querySelector(
      `form[data-id="${button.dataset.id}"]`
    );
    form?.querySelector("input")?.focus();
  }
});

postsContainer.addEventListener("submit", event => {
  const form = event.target.closest(".comment-area");
  if (!form) return;

  event.preventDefault();

  const input = form.querySelector('input[name="comment"]');
  const comment = input.value.trim();
  if (!comment) return;

  const post = posts.find(item =>
    String(item.id) === form.dataset.id
  );
  if (!post) return;

  post.comments.push(comment);
  savePosts();
  renderPosts();
});

searchInput.addEventListener("input", renderPosts);

document.querySelectorAll(".sidebar button").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".sidebar button")
      .forEach(item => item.classList.remove("active"));

    button.classList.add("active");

    const tab = button.dataset.tab;
    pageTitle.textContent =
      tab === "Home" ? "Home Feed" : tab;

    if (tab === "Home") {
      postForm.hidden = false;
      searchInput.value = "";
      renderPosts();
    } else if (tab === "Profile") {
      postForm.hidden = true;
      postsContainer.innerHTML =
        '<div class="empty">Your profile will be added in the next version.</div>';
    } else {
      postForm.hidden = true;
      postsContainer.innerHTML =
        `<div class="empty">${escapeHTML(tab)} feature will be added in the next version.</div>`;
    }
  });
});

document.getElementById("profileBtn").addEventListener("click", () => {
  document.querySelector('[data-tab="Profile"]').click();
});

renderPosts();
